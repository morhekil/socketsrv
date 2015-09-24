'use strict';

const COMMANDS = ['helo'];

class Client {
  constructor(socket) {
    console.log(socket.id, 'client connected');
    this.uuid = null;
    this.socket = socket;

    COMMANDS.forEach((c) => {
      socket.on(c, (data) => { this.command(c, data); });
    });
  }

  helo(msg) {
    if (msg && msg.channel) {
      this.uuid = msg.channel;
    }
  }

  command(cmd, data) {
    this.log(cmd, [data]);
    this[cmd].call(this, data);
  }

  log(msg, data) {
    console.log.apply(null, [this.socket.id, msg].concat(data));
  }
};

module.exports = Client;
