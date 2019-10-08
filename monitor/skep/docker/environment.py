import os
import re

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
        # e.g. DATABASE_URL=user:password@host/database
        #   becomes:
        #      DATABASE_URL=user:********@host/database
        #
        return re.sub('(^.*?://[^:]+:).*?(@.*$)', r'\1********\2', url)

    def filter(self, key):
        normalized = key.strip().lower()
        return any(x in normalized for x in self.filters)

    def serializable(self):
        return dict((k, self.sanitize(k, v)) for k, v in self.env.items())
