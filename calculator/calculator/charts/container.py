import random
import time
import traceback

from calculator.orm.base import Base

class Container:
    def __init__(self, db_path, data, publisher):
        self.db_path = db_path
        self.container_id = data.get('containerID', None)
        self.columns = ['tstamp', 'container_id', 'cpu', 'system_cpu',
                        'ram_usage', 'ram_limit', 'disk_ops', 'network_bytes']
        self.time_indices, self.data = self.fetch_data(data)
        self.publisher = publisher
        self.period = self.calculate_period()


    def build(self, sid, token):
        try:
            period, data = self.build_chart()
            self.publisher.publish(period, data, sid, token)
        except Exception as e:
            print("Error in worker:", e)
            traceback.print_exc()
            raise


    def build_chart(self):
        if not self.data or self.container_id is None:
            return None, None

        return (
            self.period,
            [
                ['Time', 'CPU', 'RAM', 'Network', 'Disk'],
                *self.chart_data()
            ]
        )

    def fetch_data(self, data):
        now = time.time()
        since = data.get('since', 3600)
        then = now - since
        data = self.execute(data['containerID'], now, then)
        interval = len(data) / since
        time_indices = [then + (interval * index) for index in range(len(data))]

        return time_indices, data

    def chart_data(self):
        charts = [self.cpu(), self.ram(), self.network(), self.disk()]

        return list(zip(self.time_indices, *charts))

    def period(self):
        data = self.data

        return max(x['tstamp'] for x in data) - min(x['tstamp'] for x in data)

    def connect(self):
        return Base(self.db_path).connect()

    def execute(self, container_id, now, then):
        db, cursor = self.connect()
        params = [container_id, now, then]
        columns = ', '.join(self.columns)
        cursor.execute('''SELECT {columns} FROM containers
                          WHERE container_id = ?
                          AND tstamp < ?
                          AND tstamp > ?'''.format(columns=columns),
                          params)
        rows = cursor.fetchall()
        return [dict((key, row[index])
                for index, key in enumerate(self.columns))
                for row in rows]

    def calculate_period(self):
        data = self.data

        return max(x['tstamp'] for x in data) - min(x['tstamp'] for x in data)

    def cpu(self):
        return [
            self.cpu_datapoint(i, x, self.data)
            for i, x in enumerate(self.data[:-1])
        ]

    def cpu_datapoint(self, i, x, data):
        return (
            (data[i + 1]['cpu'] - x['cpu'])
            /
            (data[i + 1]['system_cpu'] - x['system_cpu'])
        )

    def ram(self):
        return [x['ram_usage'] / x['ram_limit'] for x in self.data]

    def network(self):
        return [self.network_datapoint(i, x, self.data)
                for i, x in enumerate(self.data[:-1])]

    def network_datapoint(self, i, x, data):
        return (data[i + 1]['network_bytes'] - x['network_bytes']) / self.period

    def disk(self):
        return [self.disk_datapoint(i, x, self.data)
                for i, x in enumerate(self.data[:-1])]

    def disk_datapoint(self, i, x, data):
        if x['disk_ops'] is None:
            return 0

        return (data[i + 1]['disk_ops'] - x['disk_ops']) / self.period
