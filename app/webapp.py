import json
import os

from flask import Flask, jsonify, render_template, request
from flask.json import JSONEncoder
from flask_socketio import SocketIO, emit

from skep.docker.swarm import Swarm

class DelegatingJSONEncoder(JSONEncoder):
    def default(self, obj):
        return self.serialize(obj)

    def serialize(self, obj):
        if isinstance(obj, dict):
            return dict((k, self.serialize(v)) for k, v in obj)
        if isinstance(obj, list):
            return [self.serialize(x) for x in obj]
        try:
            return obj.as_json()
        except AttributeError:
            return obj

application = Flask(
    __name__,
    template_folder=os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'templates'
    )
)

application.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-key')
application.json_encoder = DelegatingJSONEncoder
socketio = SocketIO(application)

@application.route("/swarm.json")
def swarm():
    return jsonify(Swarm().manifest())

@application.route("/")
def root():
    return render_template('layout.html')

@application.route("/stats", methods=["POST"])
def stats_create():
    socketio.emit("stats", request.data)
    return 'OK', 200

@socketio.on("manifest")
def handle_message():
    emit("manifest", json.dumps(Swarm().manifest(), cls=DelegatingJSONEncoder))

if __name__ == "__main__":
    socketio.run(application)
