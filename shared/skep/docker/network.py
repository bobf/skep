class Network:
    def __init__(self, network):
        self.id = network.id
        self.name = network.name

    def serializable(self):
        return { 'id': self.id, 'name': self.name }
