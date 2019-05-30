import '../css/main.scss';
import io from 'socket.io-client';
import 'bootstrap';

import Dashboard from './dashboard';

$(function () {
  var socket = io.connect(
    location.protocol + '//' + document.domain + ':' + location.port
  );

  window.Skep = window.Skep || {};

  Skep.thresholds = {
    global: {
      success: 50,
      warning: 70
    }
  };

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

    const data = JSON.parse(json);
    const node = Skep.dashboard.getNode(data.hostname)
    if (!node) {
      console.log('Could not find node for stats collection.', data);
      return;
    }

    const previous = node.ref.current.state && node.ref.current.stats().current;
    const stats = { current: data, previous: previous || {} };
    node.ref.current.setState({ stats: stats });

    $('#node-' + node.id).addClass('ping');
    setTimeout(function () {
      $('#node-' + node.id).removeClass('ping');
    }, 200);
  });

  $('body').tooltip({
    selector: '[data-toggle="tooltip"]'
  });
});
