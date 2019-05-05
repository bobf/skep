import json
import os

from flask import Flask, jsonify, render_template
from flask.json import JSONEncoder
from flask_socketio import SocketIO, emit

from app.docker.swarm import Swarm

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

webapp = Flask(__name__)
webapp.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-key')
webapp.json_encoder = DelegatingJSONEncoder
socketio = SocketIO(webapp)

@webapp.route("/swarm.json")
def swarm():
    return jsonify(Swarm().manifest())

@webapp.route("/")
def root():
    return render_template('layout.html')

@socketio.on("manifest")
def handle_message():
    emit("manifest", json.dumps(Swarm().manifest(), cls=DelegatingJSONEncoder))

if __name__ == "__main__":
    socketio.run(webapp)
