class Node:
    def __init__(self, node):
        self.node = node

    def reachable(self):
        return self.manager_status().get('Reachability', None) == 'reachable'

    def leader(self):
        return self.manager_status().get('Leader', False)

    def manager_status(self):
        return self.node.attrs.get('ManagerStatus', {})

    def attrs(self):
        attrs = self.node.attrs

        return {
            'id': attrs['ID'],
            'hostname': attrs['Description']['Hostname'],
            'created': attrs['CreatedAt'],
            'role': attrs['Spec']['Role'],
            'leader': self.leader(),
            'reachable': self.reachable(),
            'version': attrs['Description']['Engine']['EngineVersion']
        }

    def serializable(self):
        return self.attrs()
