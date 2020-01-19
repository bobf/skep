import json
import logging
import os
import urllib.parse
from urllib.request import Request
import secrets
import socket

from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_socketio import SocketIO, emit
import requests

from skep.json import DelegatingJSONEncoder

env = {
    # Will be overwritten when charts container pings us:
    'CHARTS_URL': os.environ['SKEP_CHARTS_URL']
}

application = Flask(
    __name__,
    template_folder=os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'templates'
    )
)

if os.environ.get('FLASK_SECRET_KEY', None):
    application.config['SECRET_KEY'] = os.environ['FLASK_SECRET_KEY']
else:
    application.config['SECRET_KEY'] = secrets.token_hex(32)

application.json_encoder = DelegatingJSONEncoder
socketio = SocketIO(application)
cache = { 'manifest': {}, 'nodes': {} }

logger = logging.getLogger('skep:app')
log_level = getattr(logging, os.environ.get('LOG_LEVEL', 'info').upper())
logger.setLevel(log_level)
handler = logging.StreamHandler()
handler.setLevel(log_level)
logger.addHandler(handler)

def log(msg, params=None, level='INFO'):
    getattr(logger, level.lower())(msg.format(**(params or {})))

@application.route('/files/<path:path>')
def files(path):
    return send_from_directory('files', path)

@application.route("/")
def root():
    return render_template(
        'layout.html',
        env=os.environ.get('SKEP_ENV', 'production'),
        css_md5=os.environ.get('CSS_MD5', ''),
        js_md5=os.environ.get('JS_MD5', '')
    )

@socketio.on('init')
def handle_init():
    socketio.emit('init', json.dumps(cache))

@socketio.on('chart_request')
def handle_chart_request(params):
    params['sid'] = request.sid

    data = json.dumps(params).encode('utf8')
    headers={'Content-Type': 'application/json'}

    log('chart_request [{type}] for [sid: {sid}] [{url}]',
        dict(type=params['chartType'], sid=request.sid, url=env['CHARTS_URL']))

    try:
        response = requests.post(env['CHARTS_URL'], data=data, headers=headers)
    except urllib.error.HTTPError as e:
        log('chart_request:failure [{url}] [{headers}] [{url}] [{status} {reason}]'.format(
             url=e.url,
             headers=e.headers.items(),
             status=e.status,
             reason=e.reason))
        chart = dict(
            meta=params.get('params'),
            chartType=params.get('chartType'),
            error=True
        )
        socketio.emit('chart_response', chart)

@application.route("/charts_ping", methods=["POST"])
def charts_ping():
    port = request.form.get('port', '8080')
    url = urllib.parse.urlparse(os.environ['SKEP_CHARTS_URL'])
    ip = socket.gethostbyname(url.hostname)
    env['CHARTS_URL'] = (
        '{scheme}://{ip}:{port}/chart'.format(
            scheme=url.scheme,
            port=port,
            ip=ip
        )
    )

    return 'OK', 200

@application.route("/chart_response", methods=["POST"])
def chart_response_create():
    data = request.get_json()
    sid = data.pop('sid')
    log('chart_response {meta} for [sid: {sid}]',
        dict(meta=data['meta'], sid=sid))
    socketio.emit('chart_response', data, room=sid)

    return 'OK', 200

@application.route("/stats", methods=["POST"])
def stats_create():
    if authorize_request(request):
        data = request.get_json()
        if 'hostname' in data:
            cache['nodes'][data['hostname']] = data

        socketio.emit("stats", json.dumps(data), broadcast=True)
        return 'OK', 200

    return 'Unauthorized', 401

@application.route("/manifest", methods=["POST"])
def manifest_create():
    if authorize_request(request):
        manifest = request.get_json()
        cache['manifest'] = manifest
        socketio.emit("manifest", json.dumps(manifest), broadcast=True)
        return 'OK', 200

    return 'Unauthorized', 401

# Catch-all for favicon etc.
@application.route('/<path:path>')
def default(path):
    return send_from_directory('files/root', path)

def authorize_request(request):
    host, _, port = request.host.partition(':')

    return int(port) == int(os.environ.get('SKEP_PRIVATE_PORT', '6666'))


if __name__ == "__main__":
    socketio.run(application, host=os.environ.get('SKEP_LISTEN_HOST', '127.0.0.1'))
