import os

class Environment:
    def __init__(self, env):
        self.env = self.parse(env)
        filters = os.environ.get(
            'SKEP_ENVIRONMENT_FILTER',
            'password,token,key,secret,pass'
        )

        self.filters = [x.strip().lower() for x in filters.split(',')]

    def parse(self, env):
        return dict(self.split(keypair) for keypair in env)

    def split(self, keypair):
        key, _, value = keypair.partition('=')
        return (key, value)

    def sanitize(self, key, value):
        value = self.sanitize_url(value)

        if not self.filter(key):
            return value

        return '*' * 10

    def sanitize_url(self, url):
        # TODO: Filter proto://user:pass@example.com/ passwords
        return url

    def filter(self, key):
        normalized = key.strip().lower()
        return any(x in normalized for x in self.filters)

    def serializable(self):
        return dict((k, self.sanitize(k, v)) for k, v in self.env.items())
