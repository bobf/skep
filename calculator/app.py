#!/usr/bin/env python3

import sys
import json
import logging
import pprint
import os
import secrets
import time
from multiprocessing import Pool

from flask import Flask, request, jsonify

from skep.json import DelegatingJSONEncoder
from calculator import create_database
from calculator.charts.container import Container as ContainerChart
from calculator.charts.node import Node as NodeChart
from calculator.publisher import Publisher
from calculator.orm.container_stat import ContainerStat
from calculator.orm.node_stat import NodeStat

logger = logging.getLogger('skep:calculator')
log_level = getattr(logging, os.environ.get('LOG_LEVEL', 'info').upper())
logger.setLevel(log_level)
handler = logging.StreamHandler()
handler.setLevel(log_level)
logger.addHandler(handler)

if 'SKEP_SECRET' in os.environ:
    auth = { 'Authorization': 'Token ' + os.environ['SKEP_SECRET'] }
else:
    auth = {}

app_url = os.environ.get('SKEP_APP_URL', 'http://app:8080')
db_path = os.environ.get('SKEP_CALCULATOR_DB_PATH', '/calculator.db')
pool_size = int(os.environ.get('SKEP_CALCULATOR_CONCURRENCY', '4'))

application = Flask(__name__)
pool = Pool(pool_size)
publisher = Publisher(app_url, auth, logger)
create_database(db_path)
chart_types = {
    'container': ContainerChart,
    'node': NodeChart
}

@application.route("/chart", methods=["POST"])
def chart_create():
    data = request.get_json()

    if not all(x in data for x in ['params', 'chartType', 'requestID']):
        return (
            'Invalid request: must provide keys [params, chartType requestID]',
            422
        )

    params = data['params']
    chart_type = data['chartType']
    token = data['requestID']
    chart = chart_types[chart_type](db_path, params, publisher)
    _result = pool.apply_async(chart.build, (data['sid'], token))

    return 'OK', 200

@application.route("/stats", methods=["POST"])
def stats_create():
    data = request.get_json()
    containers = data['containers']
    tstamp = data['tstamp']
    [ContainerStat(db_path).save(container, tstamp) for container in containers]
    NodeStat(db_path).save(data, tstamp)

    return 'OK', 200

port = int(os.environ.get('SKEP_CALCULATOR_PORT', '8080'))
application.run(host='0.0.0.0', port=port)
