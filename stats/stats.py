#!/usr/bin/env python3

import json
import logging
import multiprocessing
import os
import random
import string
import sys
import shutil
import time
import urllib.parse
import urllib.request
from urllib.request import Request

os.environ['LINUX_METRICS_ROOT_FS'] = os.environ.get('HOSTFS_PATH', '/hostfs')
import linux_metrics as lm

class StatRunner:
    def __init__(self, **kwargs):
        self.opts = kwargs
        self.log = self.logger(kwargs)
        self.log.info('Launching StatRunner(%s)' % (kwargs,))

    def run(self):
        while True:
            self.ping()
            time.sleep(self.opts['interval'])

    def ping(self):
        stats = self.stats()
        self.log.debug(str(stats))
        request = Request(
            self.opts['url'],
            data=json.dumps(stats).encode('utf8'),
            headers={ 'Content-Type': 'application/json' }
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
            'networks': self.networks(),
            'memory': self.memory(),
            'disks': self.disks(),
            'filesystems': self.filesystems(),
            'cpu': self.cpu(),
            'load': self.load()
        }

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
        used, total, _, _, _, _ = lm.mem_stat.mem_stats()
        return { 'used': used, 'total': total }

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

    def networks(self):
        stats = []
        for network_interface in self.opts['network']:
            rx_bits, tx_bits = lm.net_stat.rx_tx_bits(network_interface)
            item = {
                'rx': rx_bits,
                'tx': tx_bits,
                'interface': network_interface
            }

    def logger(self, kwargs):
        logger = logging.getLogger('skep:stats')
        log_level = getattr(logging, kwargs['log_level'])
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
        interval=int(os.environ.get('INTERVAL', '5')),
        duration=int(os.environ.get('DURATION', '1')),
        log_level=os.environ.get('LOG_LEVEL', 'INFO')
    ).run()
