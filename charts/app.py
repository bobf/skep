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
db_path = os.environ.get('SKEP_CHARTS_DB_PATH', '/charts.db')
pool_size = int(os.environ.get('SKEP_CHARTS_CONCURRENCY', '4'))

application = Flask(__name__)
pool = Pool(pool_size)
publisher = Publisher(app_url, logger)
create_database(db_path)
chart_types = {
    'container': ContainerChart,
    'node': NodeChart
}

@application.route("/chart", methods=["POST"])
def chart_create():
    data = request.get_json()

    if not all(x in data for x in ['params', 'chartType']):
        return (
            'Invalid request: must provide keys [params, chartType]',
            422
        )

    params = data['params']
    chart_type = data['chartType']
    chart = chart_types[chart_type](db_path, params, publisher)
    _result = pool.apply_async(chart.build, (data['sid'],))

    return 'OK', 200

@application.route("/stats", methods=["POST"])
def stats_create():
    data = request.get_json()
    containers = data['containers']
    # Convert JS microseconds to Python milliseconds:
    tstamp = data['tstamp'] / 1000
    [ContainerStat(db_path).save(container, tstamp) for container in containers]
    NodeStat(db_path).save(data, tstamp)

    return 'OK', 200

port = int(os.environ.get('SKEP_CHARTS_PORT', '8080'))
application.run(host='0.0.0.0', port=port)
