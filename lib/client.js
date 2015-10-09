'use strict';

var SocketQueue = require('./socket_queue');

// Handshakes perform initial exchange of channel id to bind this
// client to the correct queues, and process register command
// call to set up handlers for all registered commands
const HANDSHAKES = ['helo', 'register'];
class Handshake {
  constructor(client, socket) {
    this.client = client;
    this.socket = socket;

    HANDSHAKES.forEach((c) => {
      socket.on(c, (data) => { this.execute(c, data); });
    });
  }

  // helo handshake accepts client's channel identifier as .channel
  // properly, and bootstraps client with its value
  helo(msg) {
    if (msg && msg.channel) {
      this.client.setChannel(msg.channel);
    }
  }

  // register accepts command to be added to the processable list as .command
  // property of the message, and passes it on to the client
  register(msg) {
    this.client.addCommand(msg.command);
  }

  execute(cmd, data) {
    this.log(cmd, data);
    this[cmd].call(this, data);
  }

  log(msg, data) {
    console.log.apply(null, [this.socket.id, msg].concat([data]));
  }
}

// Basic client state and operations. Client starts with unknown channel
// identity, and with no known commands to handle.
// To become operational, it must be bootstrapped with channel identification,
// and downstream (browser) MUST register the commands it needs before their
// first use. Not registered command are discarded when they are received.
class Client {
  constructor(socket, mq) {
    console.log(socket.id, 'client connected');
    this.channel = null;
    this.socket = socket;
    this.mq = mq;
    this.commands = [];

    this.hs = new Handshake(this, socket);
  }

  // clean up all connections, before destroying this client
  destroy() {
    if (this.queue) { this.queue.destroy(); }
  }

  // Set client's channel identifier. When channel ID is set,
  // we can also initiate socket queue processing.
  setChannel(channel) {
    this.channel = channel;
    this.queue = new SocketQueue(this.mq, this.channel,
                                 (cmd, msg) => { this.downstream(cmd, msg); });
  }

  // Add another commands to the list of process-able downstream commands,
  // unless it was already there.
  addCommand(cmd) {
    if (this.commands.indexOf(cmd) > -1) {
      // command already registered
      return;
    }

    this.commands.push(cmd);
    this.socket.on(cmd, (data) => { this.upstream(cmd, data); });
  }

  // Send a command and its accompanying message downstream via the socket
  downstream(cmd, msg) {
    console.log('downstream', cmd, msg);
    this.socket.emit(cmd, msg);
  }

  // Send a command and its accompanying message upstream via the queue
  upstream(cmd, msg) {
    console.log('upstream', cmd, msg);
    this.queue.request(cmd, msg);
  }
};

module.exports = Client;
