import os

class Mount:
    def __init__(self, mount):
        self.mount = mount

    def serializable(self):
        return {
            'readOnly': self.mount.get('ReadOnly', False),
            'source': self.mount['Source'],
            'target': self.mount['Target'],
            'type': self.mount['Type']
        }
