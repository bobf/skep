#!/usr/bin/env python3

import logging
import os
import time
import sys
import urllib.request

import linux_metrics as lm

class StatRunner:
    def __init__(self, **kwargs):
        self.opts = kwargs
        self.log = self.logger(kwargs)

    def run(self):
        while True:
            self.ping()
            time.sleep(self.opts['interval'])

    def ping(self):
        stats = self.stats()
        self.log.debug(str(stats))
        try:
            resp = urllib.request.urlopen(self.opts['url'], stats)
        except urllib.error.URLError:
            self.log.warn(
                'Unable to connect to Skep host: %s' % (self.opts['url'],)
            )

    def stats(self):
        return {
            'network': self.network(),
            'memory': self.memory(),
            'drives': self.drives(),
            'cpu': self.cpu()
        }

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

    def drives(self):
        stats = {}

        for drive in self.opts['drives']:
            disk, partition = drive.split(':')
            stats[disk] = stats.get(disk, {})

            stats[disk]['busy'] = lm.disk_stat.disk_busy(
                disk,
                sample_duration=self.opts['duration']
            )

            r, w = lm.disk_stat.disk_reads_writes(partition)

            stats[disk][partition] = { 'reads': r, 'writes': w }

        return stats

    def network(self):
        stats = {}
        for network_interface in self.opts['network']:
            rx_bits, tx_bits = lm.net_stat.rx_tx_bits(network_interface)
            stats[network_interface] = {
                'rx': rx_bits,
                'tx': tx_bits
            }
        return stats

    def logger(self, kwargs):
        logger = logging.getLogger('skep:stats')
        log_level = getattr(logging, kwargs['log_level'])
        logger.setLevel(log_level)
        handler = logging.StreamHandler()
        handler.setLevel(log_level)
        logger.addHandler(handler)
        return logger

if __name__ == '__main__':

    StatRunner(
        url=os.environ['SKEP_HOST_URL'],
        drives=os.environ.get('DISK_DRIVES', '').split(','),
        network=os.environ.get('NETWORK_INTERFACES', '').split(','),
        interval=int(os.environ.get('INTERVAL', '5')),
        duration=int(os.environ.get('DURATION', '1')),
        log_level=os.environ.get('LOG_LEVEL', 'INFO')
    ).run()
