import os

import docker.errors

from skep.docker.environment import Environment
from skep.docker.task import Task
from skep.docker.network import Network
from skep.docker.mount import Mount
from skep.docker.mixins import ImageParser

class Service(ImageParser):
    def __init__(self, service, swarm):
        self.service = service
        self.swarm = swarm

    def attrs(self):
        attrs = self.service.attrs
        return {
            "id": self.id(),
            "name": self.name(),
            "mode": self.mode(),
            "global": 'Global' in attrs['Spec']['Mode'],
            "replicas": self.replicas(),
            "updated": attrs['UpdatedAt'],
            "updating": self.updating(),
            "ports": self.ports(),
            "image": self.image(),
            "tasks": self.tasks(),
            "networks": self.networks(),
            "environment": self.environment(),
            "mounts": self.mounts(),
            "name_url": self.name_url(),
            "image_url": self.image_url()
        }

    def id(self):
        attrs = self.service.attrs
        return attrs['ID']

    def name(self):
        attrs = self.service.attrs
        return attrs['Spec']['Name']

    def environment(self):
        attrs = self.service.attrs
        env = attrs['Spec']['TaskTemplate']['ContainerSpec'].get('Env', [])
        return Environment(env)

    def mounts(self):
        attrs = self.service.attrs
        mounts = attrs['Spec']['TaskTemplate']['ContainerSpec'].get('Mounts', [])
        return [Mount(mount) for mount in mounts]

    def networks(self):
        attrs = self.service.attrs
        networks = attrs['Spec']['TaskTemplate'].get('Networks', [])
        network_ids = [x['Target'] for x in networks]
        return [x for x in self.swarm.networks() if x.id in network_ids]

    def mode(self):
        attrs = self.service.attrs

        if 'Global' in attrs['Spec']['Mode']:
            return 'global'

        if 'Replicated' in attrs['Spec']['Mode']:
            return 'replicated'

    def replicas(self):
        attrs = self.service.attrs
        if 'Global' in attrs['Spec']['Mode']:
            return None

        return attrs['Spec']['Mode']['Replicated']['Replicas']

    def try_tasks(self):
        try:
            return self.service.tasks()
        except docker.errors.NotFound:
            # The service was removed since we started inspecting it
            return []

    def tasks(self):
        tasks = list(filter(
            lambda x: x.desired_state() == 'running',
            [Task(x) for x in self.try_tasks()]
        ))

        replicas = self.replicas()

        if replicas is not None and len(tasks) < replicas:
            tasks = [Task({}) for x in range(replicas - len(tasks))] + tasks

        return tasks

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

    def name_url(self):
        if 'SERVICE_URL_TEMPLATE' not in os.environ:
            return None

        return os.environ['SERVICE_URL_TEMPLATE'].format(
            name=self.name(),
            id=self.id()
        )

    def image_url(self):
        if 'IMAGE_URL_TEMPLATE' not in os.environ:
            return None

        image = self.image()

        if not image:
            return None

        return os.environ['IMAGE_URL_TEMPLATE'].format(**self.image())
