import random
import time
import traceback

from charts.charts.base import Base

class Container(Base):
    @classmethod
    def get_id(class_, data):
        return data.get('containerID', None)

    def __init__(self, db_connection, data, publisher, logger):
        self.id = Container.get_id(data)
        self.table = 'containers'
        self.columns = ['tstamp', 'id', 'cpu', 'system_cpu',
                        'ram_usage', 'ram_limit', 'disk_ops', 'network_bytes']
        self.meta = { 'id': self.id, 'type': 'container' }
        super().__init__(db_connection, data, publisher, logger)

    def titles(self):
        return ('Time', 'Disk', 'Network', 'RAM', 'CPU')

    def chart_data(self):
        charts = [self.disk(), self.network(), self.ram(), self.cpu()]

        return self.merge_timeline(*charts)

    def cpu(self):
        return [
            self.cpu_datapoint(i, x, self.data)
            for i, x in enumerate(self.data[:-1])
        ]

    def cpu_datapoint(self, i, x, data):
        return (
            (data[i + 1]['cpu'] - x['cpu'])
            /
            # Ensure division by zero errors are impossible
            max(data[i + 1]['system_cpu'] - x['system_cpu'], 0.00000001)
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
