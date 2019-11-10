import math
import statistics
import time
import traceback
from operator import itemgetter

from charts.orm.base import Base as ORMBase

class Base:
    def __init__(self, db_path, data, publisher):
        self.db_path = db_path
        self.time_indices, self.data = self.fetch_data(data)
        self.period = self.calculate_period()
        self.publisher = publisher

    def titles(self):
        raise NotImplementedError

    def calculate_period(self):
        data = self.data

        if not data:
            return None

        return max(x['tstamp'] for x in data) - min(x['tstamp'] for x in data)

    def build(self, sid):
        try:
            chart = self.build_chart()
            self.publisher.publish(self.period, chart, sid, self.meta)
        except Exception as e:
            print("Error in worker:", e)
            traceback.print_exc()
            raise

    def build_chart(self):
        if not self.data or self.id is None:
            return None

        return { 'titles': self.titles(), 'data': self.chart_data() }

    def connect(self):
        return ORMBase(self.db_path).connect()

    def fetch_data(self, data):
        now = time.time()

        try:
            period = int(data.get('period', '3600'))
        except ValueError:
            period = 3600

        then = now - period
        data = self.normalize(self.execute(now, then))
        interval = len(data) / period
        time_indices = [then + (interval * index) for index in range(len(data))]

        return time_indices, data

    def normalize(self, data):
        # Reduce browser load by limiting chart data to 500 datapoints
        points = 500
        nth_element = max(int(math.ceil(len(data) / points)), 1)

        return [self.normalize_chunk(x) for x in zip(*[iter(data)] * nth_element)]

    def pick(self, key, L):
        return list(filter(lambda x: x is not None, map(itemgetter(key), L)))

    def normalize_chunk(self, chunk):
        normalized = {}

        normalized['tstamp'] = statistics.median(self.pick('tstamp', chunk))
        normalized['id'] = chunk[0]['id']
        for key in chunk[0].keys():
            if key in ('tstamp', 'id'):
                continue
            values = self.pick(key, chunk)
            if values:
                # REVIEW: Is median or mean a better average here ?
                normalized[key] = statistics.mean(values)
            else:
                normalized[key] = 0

        return normalized

    def merge_timeline(self, *charts):
        return list(zip(self.time_indices, *charts))

    def execute(self, now, then):
        db, cursor = self.connect()
        params = [self.id, now, then]
        columns = ', '.join(self.columns)
        cursor.execute('''SELECT {columns} FROM {table}
                          WHERE id = ?
                          AND tstamp < ?
                          AND tstamp > ?'''.format(
                            columns=columns,
                            table=self.table
                          ),
                          params)
        rows = cursor.fetchall()
        return [dict((key, row[index])
                for index, key in enumerate(self.columns))
                for row in rows]
