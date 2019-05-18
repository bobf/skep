class Network:
    def __init__(self, *, id):
        self.id = id

    def serializable(self):
        return { 'id': self.id }
