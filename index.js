'use strict';

var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http, { path: '/redogram' });

var amqp = require('amqp');
// connect to AMQP
var mqcon = amqp.createConnection();

// waiting until the connection is established, then proceed
mqcon.on('ready', () => {
  console.log('connected to amqp');

  // attach connection manager to HTTP server instance
  var mgr = require('./lib/manager')(io, mqcon);

  var port = 3001;
  app.get('/', (req, res) => { res.send('Chloe, open the socket!'); });
  http.listen(port,
              () => { console.log('socket server started on *:' + port); });
});
