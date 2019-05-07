class Task:
    def __init__(self, task):
        self.task = task

    def desired_state(self):
        return self.task['DesiredState']

    def attrs(self):
        attrs = self.task
        return {
            "node_id": attrs["NodeID"],
            "id": attrs["ID"]
        }

    def serializable(self):
        return self.attrs()
