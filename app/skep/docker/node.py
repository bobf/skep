class Node:
    def __init__(self, node):
        self.node = node

    def attrs(self):
        attrs = self.node.attrs
        return {
            'id': attrs['ID'],
            'hostname': attrs['Description']['Hostname'],
            'created': attrs['CreatedAt'],
            'role': attrs['Spec']['Role'],
            'leader': attrs['ManagerStatus']['Leader'],
            'reachable': attrs['ManagerStatus']['Reachability'] == 'reachable',
            'version': attrs['Description']['Engine']['EngineVersion']
        }

    def serializable(self):
        return self.attrs()
