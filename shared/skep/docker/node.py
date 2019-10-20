class Node:
    def __init__(self, node):
        self.node = node

    def reachable(self):
        return self.manager_status().get('Reachability', None) == 'reachable'

    def leader(self):
        return self.manager_status().get('Leader', False)

    def manager_status(self):
        return self.node.attrs.get('ManagerStatus', {})

    def role(self):
        return self.node.attrs['Spec']['Role']

    def version(self):
        return self.node.attrs['Description']['Engine']['EngineVersion']

    def attrs(self):
        attrs = self.node.attrs

        return {
            'id': attrs['ID'],
            'hostname': attrs['Description']['Hostname'],
            'created': attrs['CreatedAt'],
            'role': self.role(),
            'leader': self.leader(),
            'reachable': self.reachable(),
            'version': self.version()
        }

    def serializable(self):
        return self.attrs()
