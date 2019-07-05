from skep.docker.mixins import ImageParser

class Task(ImageParser):
    def __init__(self, task):
        self.task = task

    def desired_state(self):
        return self.task['DesiredState']

    def container_id(self):
        return self.task.get('Status', {}).get('ContainerStatus', {}).get('ContainerID', None)

    def attrs(self):
        attrs = self.task
        return {
            "id": attrs["ID"],
            "slot": attrs["Slot"],
            "containerID": self.container_id(),
            "nodeID": attrs["NodeID"],
            "message": attrs["Status"]["Message"],
            "when": attrs["Status"]["Timestamp"],
            "state": attrs["Status"]["State"],
            "environment": attrs['Spec']['ContainerSpec'].get('Env', []),
            "image": self.parse_image(
                attrs['Spec']['ContainerSpec'].get('Image', None)
            )
        }

    def serializable(self):
        return self.attrs()
