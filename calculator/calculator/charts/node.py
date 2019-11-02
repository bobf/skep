import random
import time
import traceback

from calculator.charts.base import Base

class Node(Base):
    def __init__(self, db_path, data, publisher):
        self.id = data.get('hostname', '').lower()
        self.table = 'nodes'
        self.columns = ['tstamp', 'id', 'load', 'cpu', 'ram']
        self.meta = { 'id': self.id, 'type': 'node' }

        super().__init__(db_path, data, publisher)

    def titles(self):
        return ('Time', 'Load', 'RAM', 'CPU')

    def chart_data(self):
        return self.merge_timeline(self.load(), self.ram(), self.cpu())

    def cpu(self):
        return [x['cpu'] for x in self.data]

    def ram(self):
        return [x['ram'] for x in self.data]

    def load(self):
        return [x['load'] for x in self.data]
