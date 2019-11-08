import '../css/main.scss';
import io from 'socket.io-client';
import 'bootstrap';

import Dashboard from './dashboard';

import { Provider } from 'react-redux';
import store from './redux/store';
import { updateSwarm } from './redux/models/swarm';
import { updateNode, pingNode, unpingNode } from './redux/models/node';
import { respondChart } from './redux/models/charts';

$(function () {
  if (typeof window === 'undefined') return;

  const socket = io.connect(
    location.protocol + '//' + document.domain + ':' + location.port
  );

  const initNode = (data) => {
    store.dispatch(updateNode(data));
    store.dispatch(pingNode(data));
    setTimeout(() => store.dispatch(unpingNode(data)), 500);
  };

  const initManifest = (data) => {
    if (!Skep.dashboard) {
      Skep.dashboard = ReactDOM.render(
        <Provider store={store}>
          <Dashboard />
        </Provider>,
        document.getElementById('content')
      );
    }
    store.dispatch(updateSwarm(data));
  };

  const Skep = {
    chartCallbacks: {},
    socket: socket,
    thresholds: {
      global: {
        success: 50,
        warning: 70
      }
    },
  };

  window.Skep = Skep;

  socket.on('connect', function() {
    socket.emit('init');
  });

  socket.on('chart_response', function(data) {
    store.dispatch(respondChart(data));
  });

  socket.on('init', function(json) {
    const data = JSON.parse(json);
    initManifest(data.manifest);
    Object.values(data.nodes).forEach((node) => initNode(node));
  });

  socket.on('manifest', function(json) {
    const data = JSON.parse(json);
    initManifest(data);
  });

  socket.on('stats', function (json) {
    const data = JSON.parse(json);
    initNode(data);
  });

  $('body').tooltip({
    selector: '[data-toggle="tooltip"]',
    placement: () => {
      // Sometimes tooltips get stuck - hook into placement function to remove
      // them before rendering. V. hacky.
      $('.tooltip.fade').remove();
      return 'auto';
    },
  });
});
