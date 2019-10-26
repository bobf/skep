import '../css/main.scss';
import io from 'socket.io-client';
import 'bootstrap';

import Dashboard from './dashboard';

import { Provider } from 'react-redux';
import store from './redux/store';
import { updateSwarm } from './redux/models/swarm';
import { updateNode } from './redux/models/node';

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
        <Provider store={store}>
          <Dashboard />
        </Provider>,
        document.getElementById('content')
      );
    }
    store.dispatch(updateSwarm(data));
  });

  socket.on('stats', function (json) {
    const data = JSON.parse(json);
    store.dispatch(updateNode(data));
  });

  $('body').tooltip({
    selector: '[data-toggle="tooltip"]'
  });
});
