import string
import random

from skep.docker.mixins import ImageParser

class Task(ImageParser):
    def __init__(self, task):
        self.task = task

    def desired_state(self):
        if not self.task:
            return None

        return self.task['DesiredState']

    def container_id(self):
        if not self.task:
            return None

        return self.task.get('Status', {}).get('ContainerStatus', {}).get('ContainerID', None)

    def image(self):
        self.parse_image(attrs['Spec']['ContainerSpec'].get('Image', None))

    def attrs(self):
        if not self.task:
            id = "".join(random.choice(string.ascii_lowercase) for _ in range(8))
            return { "id": id, "state": "loading", "message": "loading" }

        attrs = self.task
        return {
            "id": attrs["ID"],
            "slot": attrs.get("Slot", None),
            "containerID": self.container_id(),
            "nodeID": attrs["NodeID"],
            "message": attrs["Status"]["Message"],
            "when": attrs["Status"]["Timestamp"],
            "state": attrs["Status"]["State"],
            "environment": attrs['Spec']['ContainerSpec'].get('Env', []),
            "image": self.image()
        }

    def serializable(self):
        return self.attrs()
