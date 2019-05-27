class Container:
    def __init__(self, container):
        self.attrs = container.attrs
        self.id = container.id
        self.name = container.name
        self.image = container.attrs['Image']

    def error(self):
        error = self.attrs.get('State', {}).get('Error', '')

        if not error:
            return None

        return error

    def serializable(self):
        return { 'id': self.id, 'name': self.name, 'error': self.error() }
