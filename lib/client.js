'use strict';

var PlayerQueue = require('./player_queue');

const HANDSHAKES = ['helo', 'register'];

class Handshake {
  constructor(client, socket) {
    this.client = client;
    this.socket = socket;

    HANDSHAKES.forEach((c) => {
      socket.on(c, (data) => { this.execute(c, data); });
    });
  }

  execute(cmd, data) {
    this.log(cmd, data);
    this[cmd].call(this, data);
  }

  helo(msg) {
    if (msg && msg.channel) {
      this.client.setUUID(msg.channel);
    }
  }

  register(msg) {
    this.client.addCommand(msg.command);
  }

  log(msg, data) {
    console.log.apply(null, [this.socket.id, msg].concat([data]));
  }
}

class Client {
  constructor(socket, mq) {
    console.log(socket.id, 'client connected');
    this.uuid = null;
    this.socket = socket;
    this.mq = mq;
    this.commands = [];

    this.hs = new Handshake(this, socket);
  }

  setUUID(uuid) {
    this.uuid = uuid;
    this.queue = new PlayerQueue(this.mq, this.uuid,
                                 (cmd, msg) => { this.downstream(cmd, msg); });
  }

  addCommand(cmd) {
    if (this.commands.indexOf(cmd) > -1) {
      // command already registered
      return;
    }

    this.commands.push(cmd);
    this.socket.on(cmd, (data) => { this.upstream(cmd, data); });
  }

  downstream(cmd, msg) {
    console.log('downstream', cmd, msg);
    this.socket.emit(cmd, msg);
  }

  upstream(cmd, msg) {
    console.log('upstream', cmd, msg);
    this.queue.request(cmd, msg);
  }

};

module.exports = Client;
