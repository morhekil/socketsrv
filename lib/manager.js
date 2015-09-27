'use strict';

var Client = require('./client');

// Simple manager of socket.io connection. When new socket is connected,
// it instantiates and attaches a client instance to the socket.
var connector = (io, queue) => {
  var clients = {};

  io.on('connection', (socket) => {
    clients[socket.id] = new Client(socket, queue);
    socket.on('disconnect', () => { delete clients[socket.id]; });
  });
};

module.exports = connector;
