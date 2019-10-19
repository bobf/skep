import '../css/main.scss';
import io from 'socket.io-client';
import 'bootstrap';

import Dashboard from './dashboard';

$(function () {
  if (typeof window === 'undefined') return;

  var socket = io.connect(
    location.protocol + '//' + document.domain + ':' + location.port
  );

  window.Skep = window.Skep || {};

  Skep = {
    chartCallbacks: {},
    socket: socket,
    thresholds: {
      global: {
        success: 50,
        warning: 70
      }
    },
    token: function() {
      // https://gist.github.com/6174/6062387
      return Math.random()
                 .toString(36)
                 .substring(2, 15) + Math.random()
                                         .toString(36)
                                         .substring(2, 15);
    }
  };

  socket.on('connect', function() {
    socket.emit('init');
  });

  socket.on('chart_response', function(data) {
    Skep.chartCallbacks[data.requestID](data);
  });

  socket.on('manifest', function(json) {
    var data = JSON.parse(json);

    if (!Skep.dashboard) {
      Skep.dashboard = ReactDOM.render(
        React.createElement(Dashboard, null),
        document.getElementById('content')
      );
    }

    Skep.dashboard.setState(data);
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
    }, 500);
  });

  $('body').tooltip({
    selector: '[data-toggle="tooltip"]'
  });
});
