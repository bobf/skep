import random
import time
import traceback

from charts.charts.base import Base

class Node(Base):
    @classmethod
    def get_id(class_, data):
        return data.get('hostname', '').lower()

    def __init__(self, create_db_connection, data, publisher, logger):
        self.id = Node.get_id(data)
        self.table = 'nodes'
        self.columns = ['tstamp', 'id', 'load', 'cpu', 'ram']
        self.meta = { 'id': self.id, 'type': 'node' }
        super().__init__(create_db_connection, data, publisher, logger)

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
