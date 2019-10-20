
class Statistics:
    def __init__(self, swarm):
        self.swarm = swarm

    def overview(self):
        return {
            'nodes': len(self.swarm.nodes()),
            'containers': len(self.swarm.containers()),
            'networks': len(self.swarm.networks()),
            'stacks': len(self.swarm.stacks()),
            'services': sum(len(x.services) for x in self.swarm.stacks())
        }

    def leaders(self):
        return len([x for x in self.swarm.nodes() if x.leader()])

    def managers(self):
        return len([x for x in self.swarm.nodes() if x.role() == 'manager'])

    def workers(self):
        return len([x for x in self.swarm.nodes() if x.role() == 'worker'])

    def reachable_nodes(self):
        return len([x.reachable() for x in self.swarm.nodes()])

    def unique_versions(self):
        return len(set(x.version() for x in self.swarm.nodes()))

    def common_version(self):
        if self.unique_versions() != 1:
            return None

        nodes = self.swarm.nodes()
        if not nodes:
            # Probably impossible ?
            return None

        return self.swarm.nodes()[0].version()

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
            'nodes': self.nodes()
        }

