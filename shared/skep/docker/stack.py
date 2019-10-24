class Stack:
    def __init__(self, name, service_list):
        self.name = name
        self.service_list = service_list

    def services(self):
        return [x.attrs() for x in self.service_list]

    def serializable(self):
        return {
            "name": self.name,
            "services": self.services()
        }
