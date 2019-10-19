import time
import traceback

from calculator.orm.base import Base as ORMBase

class Base:
    def __init__(self, db_path, data, publisher):
        self.db_path = db_path
        self.time_indices, self.data = self.fetch_data(data)
        self.period = self.calculate_period()
        self.publisher = publisher

    def build_chart(self):
        raise NotImplementedError

    def calculate_period(self):
        data = self.data

        if not data:
            return None

        return max(x['tstamp'] for x in data) - min(x['tstamp'] for x in data)

    def build(self, sid, token):
        try:
            chart = self.build_chart()
            self.publisher.publish(self.period, chart, sid, token, self.meta)
        except Exception as e:
            print("Error in worker:", e)
            traceback.print_exc()
            raise

    def connect(self):
        return ORMBase(self.db_path).connect()

    def fetch_data(self, data):
        now = time.time()
        since = data.get('since', 3600)
        then = now - since
        data = self.execute(now, then)
        interval = len(data) / since
        time_indices = [then + (interval * index) for index in range(len(data))]

        return time_indices, data

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
