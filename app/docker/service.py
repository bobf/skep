from app.docker.task import Task

class Service:
    def __init__(self, service):
        self.service = service

    def tasks(self):
        return [Task(x) for x in self.service.tasks()]

    def as_json(self):
        return { "service": self.service.attrs, "tasks": self.tasks() }
