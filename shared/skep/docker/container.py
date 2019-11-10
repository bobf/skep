class Container:
    def __init__(self, container):
        self.attrs = container.attrs
        self.id = container.id
        # Remove `/` prefix from container name; may be a slight bug in Python
        # Docker library.
        self.name = container.name.strip('/')
        self.image = container.attrs['Image']

    def error(self):
        error = self.attrs.get('State', {}).get('Error', '')

        if not error:
            return None

        return error

    def serializable(self):
        return { 'id': self.id, 'name': self.name, 'error': self.error() }
