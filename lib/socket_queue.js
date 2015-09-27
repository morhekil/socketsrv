'use strict';

const UPSTREAM = 'socket.upstream';
const DOWNSTREAM = 'socket.downstream';

// Downstream queue is a temporary anonymous queue, that is bound
// to client's downstream channel exchange.
//
// There could be multiple downstream queues of the same type at the same time -
// e.g. if a player opened multiple browser windows. In this case, all
// downstream queues will be getting the same set of messages.
var downstreamQueue = (mq, channel) => {
  var queue = mq.queue('', { exclusive: true });
  queue.bind(DOWNSTREAM, `${DOWNSTREAM}.${channel}.#`);

  return queue;
};

var responseCmd = (routing) => {
  return routing.split('.')[3];
};

// SocketQueue wraps AMQP publish/consume and publishes/consumes messages
// from the specific player's channel only.
class SocketQueue {
  constructor(mq, channel, callback) {
    this.channel = channel;
    this.mq = mq;

    // setup downstream responses queue, with receive callback
    this.pq = downstreamQueue(mq, channel);
    this.pq.consume((msg) => { this.receive(msg, callback); });
  }

  request(topic, msg) {
    if (!msg) { msg = {}; }
    var route = `${UPSTREAM}.${this.channel}.${topic}`;

    this.mq.publish(UPSTREAM, route, JSON.stringify(msg)).then(() => {
      console.log(route, 'sent', topic, msg);
    });
  }

  receive(msg, callback) {
    var content = msg.content.toString();
    if (msg.properties.contentType == 'application/json') {
      content = JSON.parse(content);
    }
    console.log(msg.fields.routingKey, 'rcvd', content);

    callback(responseCmd(msg.fields.routingKey), content);
    this.pq.ack(msg);
  }
}

module.exports = SocketQueue;
