$(function () {
  var socket = io.connect('http://' + document.domain + ':' + location.port);
  window.Skep = window.Skep || {};

  socket.on('connect', function() {
    socket.emit('manifest');
  });

  setInterval(function () {
    socket.emit('manifest');
  }, 1000);

  socket.on('manifest', function(data) {
    var manifest = JSON.parse(data);
    console.log(manifest);
    if (!Skep.dashboard) {
      Skep.dashboard = ReactDOM.render(
        <Dashboard manifest={manifest}/>,
        document.getElementById('content')
      );
    } else {
      Skep.dashboard.setState({ manifest: manifest });
    }
  });

  socket.on('stats', function (json) {
    var data = JSON.parse(json);
    Skep.dashboard.getNode(data.hostname).setState(data);
  });
});
