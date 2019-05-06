var socket = io.connect('http://' + document.domain + ':' + location.port);
socket.on('connect', function() {
  socket.emit('manifest');
});

socket.on('manifest', function(data) {
  var manifest = JSON.parse(data);

  for (var i = 0; i < manifest.stacks.length; i++) {
    var stack = $("<div></div>");

    stack.append("<div>" + manifest.stacks[i].name + "</div>");

    for (var j = 0; j < manifest.stacks[i].services.length; j++) {
      stack.append("<div>" + manifest.stacks[i].services[j].Spec.Name + "</div>");
    }

    $("#manifest").append(stack);
  }
});

socket.on('stats', function (data) {
  console.log(JSON.parse(data));
});
