import dateutil.parser

from charts.orm.base import Base

class NodeStat(Base):
    def save(self, data, tstamp):
        self.save_node(tstamp, data)

    def save_node(self, tstamp, data):
        self.save_db('nodes',
            {
                'tstamp': tstamp,
                'id': self.hostname(data),
                'ram': self.ram(data),
                'cpu': self.cpu(data),
                'load': self.load(data)
            }
        )

    def hostname(self, data):
        return data['hostname'].lower()

    def cpu(self, data):
        return (100 - (data['cpu']['cpu_usage']['idle'] or 0)) / 100

    def ram(self, data):
        total = data['memory'].get('total', 0)
        available = data['memory'].get('available', 0)

        return 1 - (available / total)

    def load(self, data):
        return data['load']['averages'][0]
