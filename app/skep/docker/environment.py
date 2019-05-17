class Environment:
    def __init__(self, env):
        self.env = self.parse(env)
        self.filters = ['password', 'token', 'key', 'secret', 'pass']

    def parse(self, env):
        return dict(keypair.split('=') for keypair in env)

    def sanitize(self, key, value):
        if not self.filter(key):
            return value

        return '*' * 10

    def filter(self, key):
        normalized = key.strip().lower()
        return normalized in self.filters

    def serializable(self):
        return dict((k, self.sanitize(k, v)) for k, v in self.env.items())
