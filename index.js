var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, { path: '/redogram' });

app.get('/', (req, res) => {
  res.send('Chloe, open the socket!');
});

io.on('connection', (socket) => {
  console.log('user connected');
  setInterval(() => {
    var amount = Math.floor(Math.random() * 10000) / 100;
    console.log('sending balance ', amount);
    socket.emit('player.balance', { amount: amount });
  }, 1000);
});

var port = 3001;
http.listen(port, () => { console.log('socket server started on *:' + port); });
