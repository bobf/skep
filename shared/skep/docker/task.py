import string
import random

from skep.docker.mixins import ImageParser

class Task(ImageParser):
    def __init__(self, task, error_slots=None):
        self.task = task
        self.error_slots = error_slots

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
            return self.error_slots[slot]
        except KeyError:
            return []

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

    def attrs(self):
        if not self.task:
            id = "".join(random.choice(string.ascii_lowercase) for _ in range(8))
            return { "id": id, "state": "loading", "message": "loading" }

        attrs = self.task

        return {
            "id": attrs["ID"],
            "slot": self.slot(),
            "containerID": self.container_id(),
            "nodeID": attrs.get("NodeID", attrs.get("Node", None)),
            "errors": list(set(self.errors())),
            "message": attrs["Status"]["Message"],
            "when": attrs["Status"]["Timestamp"],
            "state": attrs["Status"]["State"],
            "environment": attrs['Spec']['ContainerSpec'].get('Env', []),
            "image": self.image()
        }

    def serializable(self):
        return self.attrs()
