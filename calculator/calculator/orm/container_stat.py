import sqlite3

from calculator.orm.base import Base

class ContainerStat(Base):
    def save(self, data, tstamp):
        db, cursor = self.connect()
        self.save_container(tstamp, data, cursor)
        db.commit()

    def save_container(self, tstamp, container, cursor):
        ram_usage, ram_limit = self.ram_usage(container)
        self.save_db(cursor, 'containers',
            {
                'tstamp': tstamp,
                'container_id': container['id'],
                'ram_usage': ram_usage,
                'ram_limit': ram_limit,
                'cpu': self.cpu_usage(container),
                'system_cpu': self.system_cpu_usage(container),
                'network_bytes': self.network_bytes(container),
                'disk_ops': self.disk_ops(container)
            }
        )

    def ram_usage(self, container):
        return (
            container['memory_stats']['max_usage'],
            container['memory_stats']['limit']
        )

    def cpu_usage(self, container):
        return container['cpu_stats']['cpu_usage']['total_usage']

    def system_cpu_usage(self, container):
        return container['cpu_stats']['system_cpu_usage']

    def disk_ops(self, container):
        return [
            x['value']
            for x in container['blkio_stats']['io_service_bytes_recursive']
            if x['op'] == 'Total'
        ][0]

    def network_bytes(self, container):
        return sum(
            network['rx_bytes'] + network['tx_bytes']
            for network in container['networks'].values()
        )