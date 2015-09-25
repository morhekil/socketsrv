'use strict';

var BalanceQueue = require('./balance_queue');

const COMMANDS = {
  'helo': 'helo',
  // TODO this should not know anything about the things it passes
  // though, it must be just a dumb proxy passing any messages back
  // and forth.
  //
  // Topic exchange on player:<uuid>:<queue_name>?
  'player:balance:request': 'request_balance'
};

class Client {
  constructor(socket, mq) {
    console.log(socket.id, 'client connected');
    this.uuid = null;
    this.socket = socket;
    this.queue = new BalanceQueue(mq,
                                  (msg) => { this.notify(msg); });

    Object.keys(COMMANDS).forEach((c) => {
      socket.on(c, (data) => { this.command(c, data); });
    });
  }

  helo(msg) {
    if (msg && msg.channel) {
      this.uuid = msg.channel;
      this.requestBalance();
    }
  }

  requestBalance() {
    this.queue.requestBalance(this.uuid);
  }

  notify(msg) {
    console.log('received', msg);
    this.socket.emit('player:balance:response', { amount: msg.balance });
    setTimeout(() => { this.queue.requestBalance(this.uuid); },
               5000);
  }

  command(cmd, data) {
    this.log(cmd, [data]);
    this[COMMANDS[cmd]].call(this, data);
  }

  log(msg, data) {
    console.log.apply(null, [this.socket.id, msg].concat(data));
  }
};

module.exports = Client;
