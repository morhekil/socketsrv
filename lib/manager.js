'use strict';

var Client = require('./client');

var connector = (io, queue) => {
  var clients = {};

  io.on('connection', (socket) => {
    clients[socket.id] = new Client(socket, queue);
    socket.on('disconnect', () => { delete clients[socket.id]; });
  });
};

module.exports = connector;
