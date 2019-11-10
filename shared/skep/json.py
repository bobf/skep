from flask.json import JSONEncoder

from datetime import datetime

class DelegatingJSONEncoder(JSONEncoder):
    def default(self, obj):
        return self.serialize(obj)

    def serialize(self, obj):
        if isinstance(obj, dict):
            return dict((k, self.serialize(v)) for k, v in obj)
        elif isinstance(obj, list):
            return [self.serialize(x) for x in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        try:
            return obj.serializable()
        except AttributeError:
            return obj
