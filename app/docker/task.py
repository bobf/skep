class Task:
    def __init__(self, task):
        self.task = task

    def as_json(self):
        return self.task
