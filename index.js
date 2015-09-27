'use strict';

const
    DEFAULT_PORT = 0,
    DEFAULT_SOCKET_PATH = '/redogram',
    DEFAULT_AMQP = 'amqp://localhost';

var process = require('process'),
    sockpath = process.env.SOCKET_PATH || DEFAULT_SOCKET_PATH,
    amqp_url = process.env.AMQP_URL || DEFAULT_AMQP,
    http_port = process.env.PORT || DEFAULT_PORT;

var amq = require('amq'),
    app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http, { path: sockpath });

// connect to AMQP
var mqcon = amq.createConnection(
  { host: 'localhost', debug: true },
  { reconnect : { strategy : 'constant' , initial : 1000 } }
);

// attach connection manager to HTTP server instance
var mgr = require('./lib/manager')(io, mqcon);

app.get('/', (req, res) => { res.send('Chloe, open the socket!'); });
http.listen(http_port);
http.on('listening',
        () => { console.log('socket server started on *:' +
                            http.address().port); });
