import os
from datetime import datetime
from datetime import timedelta

import docker.errors
import pytz

from skep.docker.environment import Environment
from skep.docker.task import Task
from skep.docker.network import Network
from skep.docker.mount import Mount
from skep.docker.mixins import ImageParser, ISO8601TimestampParser

class Service(ImageParser, ISO8601TimestampParser):
    def __init__(self, service, swarm):
        self.service = service
        self.swarm = swarm
        self._tasks = self.tasks(True)

    def attrs(self):
        attrs = self.service.attrs
        return {
            "id": self.id(),
            "name": self.name(),
            "mode": self.mode(),
            "global": 'Global' in attrs['Spec']['Mode'],
            "replicas": self.replicas(),
            "updated": self.updated_at(),
            "updating": self.updating(),
            "state": self.state(),
            "stateMessage": self.state_message(),
            "ports": self.ports(),
            "image": self.image(),
            "tasks": sorted(self.tasks(), key=lambda x: (x.slot(), x.when())),
            "networks": self.networks(),
            "environment": self.environment(),
            "mounts": self.mounts(),
            "nameURL": self.name_url(),
            "imageURL": self.image_url(),
            "errors": [error for task in self.tasks() for error in task.errors()]
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

    def error_slots(self, tasks):
        error_slots = {}
        erroring_tasks = list(filter(
            lambda x: x.desired_state() in ['shutdown'],
            [Task(x) for x in tasks]
        ))

        for task in erroring_tasks:
            slot = task.slot()
            message = task.error()
            if slot is None or message is None:
                continue

            since = pytz.UTC.localize(datetime.utcnow()) - task.when()
            if since > timedelta(minutes=1):
                continue

            error = { 'message': message, 'since': since.seconds }

            error_slots.setdefault((self.name(), slot), []).append(error)

        return error_slots

    def tasks(self, init=False):
        if not init:
            return self._tasks

        all_tasks = self.try_tasks()

        error_slots = self.error_slots(all_tasks)

        tasks = list(filter(
            lambda x: x.desired_state() in ['running', 'ready'],
            [Task(x, self, error_slots) for x in all_tasks]
        ))

        replicas = self.replicas()

        if replicas is not None and len(tasks) < replicas:
            return [Task({}) for x in range(replicas - len(tasks))] + tasks

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

    def state(self):
        return self.service.attrs.get('UpdateStatus', {}).get('State', None)

    def state_message(self):
        return self.service.attrs.get('UpdateStatus', {}).get('Message', None)

    def rolling_back(self):
        return self.state() == 'rollback_started'

    def updating(self):
        return self.state() in ('updating', 'rollback_started')

    def updated_at(self):
        return self.parse_iso8601_timestamp(self.service.attrs['UpdatedAt'])

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
