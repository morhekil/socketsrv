'use strict';

var process = require('process'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http, { path: '/redogram' });

var amq = require('amq');
// connect to AMQP
var mqcon = amq.createConnection(
  { host: 'localhost', debug: true },
  { reconnect : { strategy : 'constant' , initial : 1000 } }
);

const DEFAULT_PORT = 3001;

var work = function() {
  // attach connection manager to HTTP server instance
  var mgr = require('./lib/manager')(io, mqcon);

  app.get('/', (req, res) => { res.send('Chloe, open the socket!'); });
  var port = process.env.PORT || DEFAULT_PORT;
  http.listen(port,
              () => { console.log('socket server started on *:' + port); });
};
work();

// waiting until the connection is established, then proceed
// mqcon.on('ready', () => {
//   console.log('connected to amqp');
//   try {
//     work();
//   } catch (err) {
//     console.log(err);
//     process.exit(-1);
//   }
// });
