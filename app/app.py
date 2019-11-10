import json
import os
import urllib.parse
from urllib.request import Request
import secrets

from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_socketio import SocketIO, emit

from skep.json import DelegatingJSONEncoder

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
    url = os.environ['SKEP_CHARTS_URL']
    params['sid'] = request.sid
    charts_request = Request(
        urllib.parse.urljoin(url, 'chart'),
        data=json.dumps(params).encode('utf8'),
        headers={'Content-Type': 'application/json'}
    )

    response = urllib.request.urlopen(charts_request)

@application.route("/chart_response", methods=["POST"])
def chart_response_create():
    data = request.get_json()
    sid = data.pop('sid')
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

def authorize_request(request):
    host, _, port = request.host.partition(':')

    return int(port) == int(os.environ.get('SKEP_PRIVATE_PORT', '6666'))


if __name__ == "__main__":
    socketio.run(application, host=os.environ.get('SKEP_LISTEN_HOST', '127.0.0.1'))
