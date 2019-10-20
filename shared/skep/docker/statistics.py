
class Statistics:
    def __init__(self, swarm):
        self.data = swarm

    def overview(self):
        return {
            'nodes': len(self.data.nodes()),
            'containers': len(self.data.containers()),
            'networks': len(self.data.networks()),
            'stacks': len(self.data.stacks()),
            'services': sum(len(x.services) for x in self.data.stacks())
        }

    def swarm(self):
        attrs = self.data.attrs()

        return {
            'name': attrs['name'],
            'created': attrs['created'],
            'updated': attrs['updated']
        }

    def leaders(self):
        return len([x for x in self.data.nodes() if x.leader()])

    def managers(self):
        return len([x for x in self.data.nodes() if x.role() == 'manager'])

    def workers(self):
        return len([x for x in self.data.nodes() if x.role() == 'worker'])

    def reachable_nodes(self):
        return len([x.reachable() for x in self.data.nodes()])

    def unique_versions(self):
        return len(set(x.version() for x in self.data.nodes()))

    def common_version(self):
        if self.unique_versions() != 1:
            return None

        nodes = self.data.nodes()
        if not nodes:
            # Probably impossible ?
            return None

        return self.data.nodes()[0].version()

    def nodes(self):
        return {
            'leaders': self.leaders(),
            'managers': self.managers(),
            'workers': self.workers(),
            'reachableNodes': self.reachable_nodes(),
            'uniqueVersions': self.unique_versions(),
            'commonVersion': self.common_version()
        }

    def serialize(self):
        return {
            'overview': self.overview(),
            'swarm': self.swarm(),
            'nodes': self.nodes()
        }

