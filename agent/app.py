#!/usr/bin/env python3

import http.client
import json
import logging
import multiprocessing
import os
import os.path
import queue
import random
import pprint
import string
import sys
import shutil
import time
import collections
import urllib.parse
import urllib.request
from urllib.request import Request

os.environ['LINUX_METRICS_ROOT_FS'] = os.environ.get('HOSTFS_PATH', '/hostfs')
import linux_metrics as lm
import docker
import docker.errors

import stats.memory as memory

class StatRunner:
    cache = collections.deque([], 10)

    def __init__(self, **kwargs):
        self.opts = kwargs
        self.connection_errors = (
            urllib.error.URLError,
            http.client.RemoteDisconnected,
            ConnectionResetError
        )
        self.log = self.logger(kwargs)
        self.log.info('Launching Agent(%s)' % (kwargs,))
        self.polled_containers = set()

    def docker(self):
        # Host Docker socket must be mounted in agent containers here:
        return docker.DockerClient(base_url='unix://var/run/docker.sock')

    def run(self):
        while True:
            self.ping()

    def url(self, type):
        return urllib.parse.urljoin(
            self.opts['{type}_url'.format(type=type)],
            '/stats'
        )

    def publish(self, type, stats):
        url = self.url(type)
        data = json.dumps(stats).encode('utf8')
        request = self.request(url, data)

        try:
            response = urllib.request.urlopen(request, timeout=5)
        except self.connection_errors as e:
            self.log.warning(
                'Could not publish %s stats: %s (%s)' % (type, url, e)
            )
        else:
            self.log.debug(
                'Published %s stats: %s %s' % (type, response.getcode(), response.read())
            )

    def request(self, url, data):
        headers = { 'Content-Type': 'application/json' }

        return Request(url, data=data, headers=headers)

    def ping(self):
        stats = self.stats()
        stats['tstamp'] = time.time()

        self.cache.append(stats)
        self.log.debug(pprint.pformat(stats))
        self.publish('app', self.stats_with_averaged_container_stats(stats))
        stats['containers'] = [c for c in stats['containers'] if c['polled']]
        self.publish('charts', stats)

    def stats(self):
        return {
            'hostname': self.opts['hostname'],
            'containers': self.containers(),
            'network': self.network(),
            'memory': self.memory(),
            'disks': self.disks(),
            'filesystems': self.filesystems(),
            'cpu': self.cpu(),
            'load': self.load()
        }

    def stats_with_averaged_container_stats(self, stats):
        copy = dict((k, v) for k, v in stats.items())
        copy['containers_averaged_cpu'] = self.containers_averaged_cpu(stats)
        copy['containers_averaged_network_io'] = self.containers_averaged_network_io(stats)
        copy['containers_averaged_disk_io'] = self.containers_averaged_disk_io(stats)
        copy['containers_stats_start'] = self.cache[0]['tstamp']
        copy['containers_stats_end'] = self.cache[-1]['tstamp']
        return copy

    def containers_averaged_disk_io(self, stats):
        averages = {}
        def io(container):
            return sum(
                x['value']
                for x in (container['blkio_stats']['io_service_bytes_recursive'] or [])
                if x['op'] == 'Total'
            )

        for container in stats['containers']:
            if not container['polled']:
                continue
            key = container['id']
            values = [
                io(c)
                for stat in self.cache
                for c in stat['containers']
                if c['id'] == key and c['polled']
            ]
            if values:
                averages[key] = values[-1] - values[0]
            else:
                averages[key] = 0
        return averages

    def containers_averaged_network_io(self, stats):
        averages = {}
        for container in stats['containers']:
            if not container['polled']:
                continue
            key = container['id']
            values = [
                sum(n['rx_bytes'] + n['tx_bytes'] for n in c['networks'].values())
                for stat in self.cache for c in stat['containers']
                if c['id'] == key and c['polled'] and 'networks' in c
            ]
            if values:
                averages[key] = values[-1] - values[0]
            else:
                averages[key] = 0
        return averages

    def containers_averaged_cpu(self, stats):
        averages = {}
        for container in stats['containers']:
            if not container['polled']:
                continue
            key = container['id']
            values = [
                c['cpu_stats']['cpu_usage']['total_usage'] / c['cpu_stats']['system_cpu_usage']
                for stat in self.cache for c in stat['containers']
                if c['id'] == key and c['polled'] and 'system_cpu_usage' in c['cpu_stats']
            ]
            if values:
                averages[key] = sum(values) / len(values)
            else:
                averages[key] = 0
        return averages

    def container_definition(self, container, with_stats=False):
        definition = { 'id': container.id, 'name': container.name }
        if with_stats:
            definition.update(self.docker().containers.get(container.id).stats(stream=False))
        definition['polled'] = with_stats
        # Remove `/` prefix from container name; may be a slight bug in Python Docker library.
        definition['name'] = definition['name'].strip('/')
        return definition

    def containers(self):
        params = { 'filters': { 'status': 'running' } }
        try:
            containers = self.docker().containers.list(**params)
        except docker.errors.NotFound:
            # A container was removed while we were inspecting it.
            return []

        definitions = []
        polled_count = 0
        for container in containers:
            if container.id not in self.polled_containers and polled_count < self.opts['stats_batch_size']:
                polled_count += 1
                self.polled_containers.add(container.id)
                poll = True
            else:
                poll = False
            definitions.append(self.container_definition(container, poll))
        if polled_count == 0:
            self.polled_containers.clear()
        return definitions

    def load(self):
        return {
            'averages': list(os.getloadavg()),
            'cores': multiprocessing.cpu_count()
        }

    def filesystems(self):
        usages = [
            (path, shutil.disk_usage(path))
            for path in self.opts['filesystems']
            if os.path.isdir(path)
        ]

        return [
            { 'path': path,
              'total': usage.total,
              'free': usage.free,
              'used': usage.used }
            for path, usage in usages
        ]

    def cpu(self):
        return {
            'processes': lm.cpu_stat.procs_running(),
            'cpu_usage': lm.cpu_stat.cpu_percents(
                sample_duration=self.opts['duration']
            )
        }

    def memory(self):
        return memory.stats()

    def disks(self):
        stats = []
        duration = self.opts['duration']

        for disk in list(self.opts['disks']):
            io_operations, io_time, weighted = lm.disk_io_operations(disk)
            reads_per_sec, writes_per_sec = lm.disk_reads_writes_persec(
                disk, sample_duration=duration
            )

            stats.append({
                'name': disk,
                'io': {
                    'ops': io_operations,
                    'time': io_time,
                    'weighted': weighted,
                    'tps': {
                        'reads': reads_per_sec,
                        'writes': writes_per_sec
                    }
                }
            })

        return stats

    def network(self):
        stats = {}
        for network_interface in self.opts['network']:
            try:
                rx_bits, tx_bits = lm.net_stat.rx_tx_bits(network_interface)
            except lm.NetError:
                message = "Unknown network interface: {interface}"
                self.log.warning(message.format(interface=network_interface))
                continue

            stats[network_interface] = {
                'rx': rx_bits,
                'tx': tx_bits
            }
        return stats

    def logger(self, kwargs):
        logger = logging.getLogger('skep:agent')
        log_level = getattr(logging, kwargs['log_level'].upper())
        logger.setLevel(log_level)
        handler = logging.StreamHandler()
        handler.setLevel(log_level)
        logger.addHandler(handler)
        return logger

def hostname():
    if 'SKEP_HOST' in os.environ:
        # Allow manual configuration for e.g. testing on Mac with Docker
        # Machine.
        return os.environ['SKEP_HOST']

    path = os.environ.get('HOSTNAME_PATH', '/hostfs/etc/hostname')

    try:
        return open(path, 'r').read().strip()
    except FileNotFoundError:
        return ''.join(
            random.choice(string.ascii_lowercase)
            for _ in range(8)
        )

if __name__ == '__main__':
    StatRunner(
        hostname=hostname().lower(),
        app_url=os.environ['SKEP_APP_URL'],
        charts_url=os.environ['SKEP_CHARTS_URL'],
        disks=list(
            filter(None, os.environ.get('DISKS', '').split(','))
        ),
        filesystems=list(
            filter(None, os.environ.get('FILE_SYSTEMS', '').split(','))
        ),
        network=list(
            filter(None, os.environ.get('NETWORK_INTERFACES', '').split(','))
        ),
        interval=int(os.environ.get('COLLECT_INTERVAL', '5')),
        duration=int(os.environ.get('SAMPLE_DURATION', '1')),
        stats_batch_size=int(os.environ.get('CONTAINER_STATS_BATCH_SIZE', '1')),
        log_level=os.environ.get('LOG_LEVEL', 'INFO')
    ).run()
