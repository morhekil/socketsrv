'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, { path: '/redogram' });

// attach connection manager to HTTP server instance
var mgr = require('./lib/manager')(io);

var port = 3001;
app.get('/', (req, res) => { res.send('Chloe, open the socket!'); });
http.listen(port, () => { console.log('socket server started on *:' + port); });
