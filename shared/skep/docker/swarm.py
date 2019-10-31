import itertools
import os

import docker

from skep.docker.container import Container
from skep.docker.network import Network
from skep.docker.node import Node
from skep.docker.service import Service
from skep.docker.stack import Stack

class Swarm:
    def __init__(self):
        socket_url = os.environ.get(
            'DOCKER_HOST',
            'unix://var/run/docker.sock'
        )
        self.client = docker.DockerClient(base_url=socket_url)

    def refresh(self):
        self.client.swarm.reload()
        try:
            self._containers = self.load_containers()
        except docker.errors.NotFound:
            # Race condition can occur here; skip container data harvest on this
            # run.
            self._containers = []

        self._nodes = self.load_nodes()
        self._networks = self.load_networks()
        self._stacks = self.load_stacks()

    def containers(self):
        return self._containers

    def nodes(self):
        return self._nodes

    def networks(self):
        return self._networks

    def stacks(self):
        return self._stacks

    def manifest(self):
        self.refresh()
        return {
            "containers": self.containers(),
            "nodes": self.nodes(),
            "stacks": self.stacks(),
            "networks": self.networks(),
            "swarm": self
        }

    def load_containers(self):
        return [
            Container(container) for
            container in self.client.containers.list()
        ]

    def load_networks(self):
        return [Network(network) for network in self.client.networks.list()]

    def load_stacks(self):
        return [
            Stack(name, list(Service(x, swarm=self) for x in services))
            for name, services in self.grouped_services()
        ]

    def grouped_services(self):
        return itertools.groupby(
            sorted(self.client.services.list(), key=self.stack_key),
            key=self.stack_label
        )

    def load_nodes(self):
        return [Node(x) for x in self.client.nodes.list()]

    def attrs(self):
        attrs = self.client.swarm.attrs
        return {
            "created": attrs["CreatedAt"],
            "name": attrs["Spec"]["Name"],
            "updated": attrs["UpdatedAt"]
        }

    def serializable(self):
        return self.attrs()

    def stack_key(self, obj):
        return obj.attrs['Spec']['Labels'].get(
            'com.docker.stack.namespace',
            '~'
        )

    def stack_label(self, obj):
        return obj.attrs['Spec']['Labels'].get(
            'com.docker.stack.namespace',
            '[services]'
        )
