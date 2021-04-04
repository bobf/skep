#!/usr/bin/env python3

import sys
import json
import logging
import pprint
import os
import secrets
import socket
import time
import urllib
import psycopg2
from multiprocessing import Pool

from flask import Flask, request, jsonify

from skep.json import DelegatingJSONEncoder
from charts import create_database
from charts.charts.container import Container as ContainerChart
from charts.charts.node import Node as NodeChart
from charts.publisher import Publisher
from charts.orm.container_stat import ContainerStat
from charts.orm.node_stat import NodeStat

logger = logging.getLogger('skep:charts')
log_level = getattr(logging, os.environ.get('LOG_LEVEL', 'info').upper())
logger.setLevel(log_level)
handler = logging.StreamHandler()
handler.setLevel(log_level)
logger.addHandler(handler)

app_url = os.environ.get('SKEP_APP_URL', 'http://app:8080')
charts_url = os.environ.get('SKEP_CHARTS_URL', 'http://charts:8080')
db_host = os.environ.get('SKEP_CHARTS_DB_HOST', 'database:5432')
pool_size = int(os.environ.get('SKEP_CHARTS_CONCURRENCY', '4'))

application = Flask(__name__)

publisher = Publisher(app_url, logger)
create_database(db_host)
chart_types = {
    'container': ContainerChart,
    'node': NodeChart
}

def create_db_connection():
    return psycopg2.connect('postgresql://postgres:@%s/skep' % db_host)

db_connection = create_db_connection()

def publish_chart(data):
    chart_type = data['chartType']
    chart = chart_types[chart_type](db_connection, data['params'], publisher, logger)
    chart.build(data['sid'])

pool = Pool(pool_size)

@application.route("/chart", methods=["POST"])
def chart_create():
    data = request.get_json()

    if not all(x in data for x in ['params', 'chartType']):
        return (
            'Invalid request: must provide keys [params, chartType]',
            422
        )

    pool.apply_async(publish_chart, (data,))

    return 'OK', 200

@application.route("/stats", methods=["POST"])
def stats_create():
    data = request.get_json()
    containers = data['containers']
    # Convert JS microseconds to Python milliseconds:
    tstamp = data['tstamp'] / 1000
    [ContainerStat(db_connection, logger).save(container, tstamp) for container in containers]
    NodeStat(db_connection, logger).save(data, tstamp)

    try:
        urllib.request.urlopen(
            urllib.parse.urljoin(app_url, 'charts_ping'),
            data=urllib.parse.urlencode(dict(url=charts_url())).encode()
        )
    except urllib.error.URLError as e:
        logger.warning('Unable to reach app container: ping failed ({e})'.format(e=e))

    return 'OK', 200

def charts_url():
    # Generate URL with resolved IP address to pass to main app to mitigate strange DNS issues.
    url = urllib.parse.urlparse(os.environ['SKEP_CHARTS_URL'])
    ip = socket.gethostbyname(url.hostname)
    return '{scheme}://{ip}:{port}/chart'.format(scheme=url.scheme, port=url.port, ip=ip)

port = int(os.environ.get('SKEP_CHARTS_PORT', '8080'))
application.run(host='0.0.0.0', port=port)
