#!/usr/bin/env python3

import json
import logging
import pprint
import os
import sys
import time
import urllib.parse
import urllib.request
from urllib.request import Request

from skep.docker.swarm import Swarm
from skep.delegating_json_encoder import DelegatingJSONEncoder

if 'SKEP_SECRET' in os.environ:
    AUTH = { 'Authorization': 'Token ' + os.environ['SKEP_SECRET'] }
else:
    AUTH = {}

class Monitor:
    def __init__(self, **kwargs):
        self.opts = kwargs
        self.log = self.logger(kwargs)
        self.log.info('Launching Monitor(%s)' % (kwargs,))

    def run(self):
        while True:
            self.ping()
            time.sleep(self.opts['interval'])

    def ping(self):
        manifest = Swarm().manifest()
        self.log.debug(pprint.pformat(manifest))
        data = json.dumps(manifest, cls=DelegatingJSONEncoder).encode('utf8')
        request = Request(
            self.opts['url'],
            data=data,
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

    def logger(self, kwargs):
        logger = logging.getLogger('skep:monitor')
        log_level = getattr(logging, kwargs['log_level'].upper())
        logger.setLevel(log_level)
        handler = logging.StreamHandler()
        handler.setLevel(log_level)
        logger.addHandler(handler)
        return logger

if __name__ == '__main__':
    Monitor(
        url=urllib.parse.urljoin(os.environ['SKEP_APP_URL'], '/manifest'),
        interval=int(os.environ.get('COLLECT_INTERVAL', '5')),
        duration=int(os.environ.get('SAMPLE_DURATION', '1')),
        log_level=os.environ.get('LOG_LEVEL', 'INFO')
    ).run()
