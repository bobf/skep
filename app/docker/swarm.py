import itertools
import os

import docker

from app.docker.node import Node
from app.docker.service import Service
from app.docker.stack import Stack

class Swarm:
    def __init__(self):
        socket_url = os.environ.get(
            'DOCKER_HOST',
            'unix://var/run/docker.sock'
        )
        self.client = docker.DockerClient(base_url=socket_url)

    def manifest(self):
        self.client.swarm.reload()
        return {
            "nodes": self.nodes(),
            "stacks": self.stacks(),
            "swarm": self
        }

    def stacks(self):
        return [
            Stack(name, list(services))
            for name, services in self.grouped_services()
        ]

    def grouped_services(self):
        return itertools.groupby(
            sorted(self.client.services.list(), key=self.by_stack),
            key=self.by_stack
        )

    def nodes(self):
        return [Node(x) for x in self.client.nodes.list()]

    def as_json(self):
        return self.client.swarm.attrs

    def by_stack(self, obj):
        return obj.attrs['Spec']['Labels']['com.docker.stack.namespace']
