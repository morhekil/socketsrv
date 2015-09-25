'use strict';

const BALANCE_REQS = 'player:balance:requests';
const BALANCE_RESP = 'player:balance:responses';

class BalanceQueue {
  constructor(mq, callback) {
    this.mq = mq;

    // declare requests queue
    mq.queue(BALANCE_REQS);

    // declare responses queue, and bind to it
    mq.queue(BALANCE_RESP, function(q) {
      q.bind('#');
      q.subscribe(callback);
    });
  }

  requestBalance(uuid) {
    console.log('publishing', BALANCE_REQS, uuid);
    this.mq.publish(BALANCE_REQS, { uuid: uuid });
  }
}

module.exports = BalanceQueue;
