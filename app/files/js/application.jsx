import io from 'socket.io-client';
import 'bootstrap';

import Dashboard from './dashboard';

$(function () {
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  window.Skep = window.Skep || {};

  socket.on('connect', function() {
    socket.emit('manifest');
  });

  setInterval(function () {
    socket.emit('manifest');
  }, 5000);

  socket.on('manifest', function(data) {
    var manifest = JSON.parse(data);

    if (!Skep.dashboard) {
      Skep.dashboard = ReactDOM.render(
        React.createElement(Dashboard, null),
        document.getElementById('content')
      );
    }

    Skep.dashboard.setState({ manifest: manifest });
  });

  socket.on('stats', function (json) {
    if (!Skep.dashboard) return;

    var data = JSON.parse(json);
    var node = Skep.dashboard.getNode(data.hostname)
    if (!node) {
      console.log('Could not find node for stats collection.', data);
      return;
    }

    node.ref.current.setState({ stats: data });
  });

  $('body').tooltip({
    selector: '[data-toggle="tooltip"]'
  });
});
