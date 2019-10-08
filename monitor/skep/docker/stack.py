class Stack:
    def __init__(self, name, services):
        self.name = name
        self.services = services

    def serializable(self):
        return {
            "name": self.name,
            "services": [x.attrs() for x in self.services]
        }
