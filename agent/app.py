#!/usr/bin/env python3

import json
import logging
import multiprocessing
import os
import queue
import random
import pprint
import string
import sys
import shutil
import threading
import time
import urllib.parse
import urllib.request
from urllib.request import Request

os.environ['LINUX_METRICS_ROOT_FS'] = os.environ.get('HOSTFS_PATH', '/hostfs')
import linux_metrics as lm
import docker

import stats.memory as memory

if 'SKEP_SECRET' in os.environ:
    AUTH = { 'Authorization': 'Token ' + os.environ['SKEP_SECRET'] }
else:
    AUTH = {}

class StatRunner:
    def __init__(self, **kwargs):
        self.opts = kwargs
        self.log = self.logger(kwargs)
        self.log.info('Launching StatRunner(%s)' % (kwargs,))

    def docker(self):
        # Host Docker socket must be mounted in agent containers here:
        return docker.DockerClient(base_url='unix://var/run/docker.sock')

    def run(self):
        while True:
            self.ping()
            time.sleep(self.opts['interval'])

    def ping(self):
        stats = self.stats()
        self.log.debug(pprint.pformat(stats))
        request = Request(
            self.opts['url'],
            data=json.dumps(stats).encode('utf8'),
            headers={ 'Content-Type': 'application/json', **AUTH }
        )

        try:
            resp = urllib.request.urlopen(request)
        except urllib.error.URLError as e:
            self.log.warning(
                'Could not publish stats: %s (%s)' % (self.opts['url'], e)
            )
        else:
            self.log.debug(
                'Published stats: %s %s' % (resp.getcode(), resp.read())
            )

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

    def container_stats(self, q, container_id):
        def stats():
            q.put(
                (container_id,
                 self.docker().containers.get(container_id).stats(stream=False))
            )
        return stats

    def containers(self):
        params = { 'filters': { 'status': 'running' } }
        containers = self.docker().containers.list(**params)

        q = queue.Queue()

        threads = [self.create_thread(q, container) for container in containers]

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

        containers = []

        while True:
            try:
                container_id, stats = q.get(block=False)
                stats['id'] = container_id
                containers.append(stats)
            except queue.Empty:
                break

        return containers

    def create_thread(self, q, container):
        return threading.Thread(
            group=None,
            target=self.container_stats(q, container.id),
            name=container.name,
            daemon=True
        )

    def load(self):
        return {
            'averages': list(os.getloadavg()),
            'cores': multiprocessing.cpu_count()
        }

    def filesystems(self):
        usages = [
            (path, shutil.disk_usage(path))
            for path in self.opts['filesystems']
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
        hostname=hostname(),
        url=urllib.parse.urljoin(os.environ['SKEP_APP_URL'], '/stats'),
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
        log_level=os.environ.get('LOG_LEVEL', 'INFO')
    ).run()
