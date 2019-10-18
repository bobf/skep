import random
import time
import traceback

from calculator.charts.base import Base

class Node(Base):
    def __init__(self, db_path, data, publisher):
        self.id = data.get('hostname', '').lower()
        self.table = 'nodes'
        self.columns = ['tstamp', 'id', 'load', 'cpu', 'ram']

        super().__init__(db_path, data, publisher)

    def build_chart(self):
        if not self.data or self.id is None:
            return None, None

        return (
            self.period,
            [
                ['Time', 'CPU', 'RAM', 'Load'],
                *self.chart_data()
            ]
        )

    def chart_data(self):
        charts = [self.cpu(), self.ram(), self.load()]

        return list(zip(self.time_indices, *charts))

    def cpu(self):
        return [x['cpu'] for x in self.data]

    def ram(self):
        return [x['ram'] for x in self.data]

    def load(self):
        return [x['load'] for x in self.data]
