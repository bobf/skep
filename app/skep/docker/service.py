from skep.docker.environment import Environment
from skep.docker.task import Task
from skep.docker.network import Network
from skep.docker.mixins import ImageParser

class Service(ImageParser):
    def __init__(self, service):
        self.service = service

    def attrs(self):
        attrs = self.service.attrs
        return {
            "name": attrs['Spec']['Name'],
            "updated": attrs['UpdatedAt'],
            "updating": self.updating(),
            "ports": self.ports(),
            "image": self.image(),
            "tasks": self.tasks(),
            "networks": self.networks(),
            "environment": self.environment()
        }

    def environment(self):
        attrs = self.service.attrs
        env = attrs['Spec']['TaskTemplate']['ContainerSpec'].get('Env', [])
        return Environment(env)

    def networks(self):
        attrs = self.service.attrs
        networks = attrs['Spec']['TaskTemplate'].get('Networks', [])
        return [Network(id=network['Target']) for network in networks]

    def tasks(self):
        return list(filter(
            lambda x: x.desired_state() == 'running',
            [Task(x) for x in self.service.tasks()]
        ))

    def ports(self):
        mappings = []
        for mapping in self.service.attrs['Endpoint'].get('Ports', []):
            mappings.append({
                "published": mapping['PublishedPort'],
                "target": mapping['TargetPort']
            })
        return mappings

    def image(self):
        return self.parse_image(
            self.service.attrs['Spec']['TaskTemplate']['ContainerSpec']['Image']
        )

    def updating(self):
        state = self.service.attrs.get('UpdateStatus', {}).get('State', None)
        return state == 'updating'

    def serializable(self):
        return self.attrs()
