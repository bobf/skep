import random
import time

from calculator.orm.base import Base

class Container:
    def __init__(self, db_path, data, publisher):
        self.db_path = db_path
        self.data = data
        self.publisher = publisher
        self.columns = ['tstamp', 'container_id', 'cpu', 'system_cpu',
                        'ram_usage', 'ram_limit', 'disk_ops', 'network_bytes']


    def build(self, sid, token):
        try:
            period, data = self.build_chart()
            self.publisher.publish(period, data, sid, token)
        except Exception as e:
            print("Error in worker:", e)
            raise


    def build_chart(self):
        if 'containerID' not in self.data:
            return ['Time', 'CPU', 'RAM']

        now = time.time()
        since = self.data.get('since', 3600)
        then = now - since
        data = self.execute(self.data['containerID'], now, then)
        interval = len(data) / since
        time_indices = [then + (interval * index) for index in range(len(data))]
        period = max(x['tstamp'] for x in data) - min(x['tstamp'] for x in data)
        chart_data = list(zip(time_indices, self.cpu(data), self.ram(data)))

        return (
            period,
            [
                ['Time', 'CPU', 'RAM'],
                *chart_data
            ]
        )

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

    def cpu(self, data):
        return [
            self.cpu_datapoint(i, x, data)
            for i, x in enumerate(data[:-1])
        ]

    def cpu_datapoint(self, i, x, data):
        return (
            (data[i + 1]['cpu'] - x['cpu'])
            /
            (data[i + 1]['system_cpu'] - x['system_cpu'])
        )

    def ram(self, data):
        return [x['ram_usage'] / x['ram_limit'] for x in data]
