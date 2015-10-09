'use strict';

var Client = require('./client');

// Simple manager of socket.io connection. When new socket is connected,
// it instantiates and attaches a client instance to the socket.
var connector = (io, queue) => {
  io.on('connection', (socket) => {
    var client = new Client(socket, queue);
    socket.on('disconnect', () => {
      console.log('client ' + socket.id + ' disconnected');
      client.destroy();
    });
  });
};

module.exports = connector;
