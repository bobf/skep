import string
import random
import dateutil.parser

from skep.docker.mixins import ImageParser

class Task(ImageParser):
    def __init__(self, task, service=None, error_slots=None):
        self.task = task
        self.service = service
        self.error_slots = error_slots

    def id(self):
        return self.task['ID']

    def desired_state(self):
        if not self.task:
            return None

        return self.task['DesiredState']

    def errors(self):
        if self.error_slots is None:
            # First pass - gathering errors from related tasks.
            return []

        slot = self.slot()
        try:
            errors = self.error_slots[(self.service.name(), slot)]
        except KeyError:
            return []
        else:
            return sorted(errors, key=lambda x: x['since'])

    def error(self):
        return self.task["Status"].get("Err", None)

    def slot(self):
        return self.task.get("Slot", None)

    def container_status(self):
        return self.task.get('Status', {}).get('ContainerStatus', {})

    def container_id(self):
        if not self.task:
            return None

        return self.container_status().get('ContainerID', None)

    def image(self):
        return self.parse_image(self.task['Spec']['ContainerSpec'].get('Image', None))

    def when(self):
        if not self.task:
            return None

        return dateutil.parser.parse(self.task["Status"]["Timestamp"])

    def attrs(self):
        if not self.task:
            id = "".join(random.choice(string.ascii_lowercase) for _ in range(8))
            return { "id": id, "state": "loading", "message": "loading" }

        attrs = self.task

        return {
            "id": self.id(),
            "slot": self.slot(),
            "containerID": self.container_id(),
            "nodeID": attrs.get("NodeID", attrs.get("Node", None)),
            "errors": self.errors(),
            "message": attrs["Status"]["Message"],
            "when": attrs["Status"]["Timestamp"],
            "state": attrs["Status"]["State"],
            "environment": attrs['Spec']['ContainerSpec'].get('Env', []),
            "image": self.image()
        }

    def serializable(self):
        return self.attrs()
