'use strict';

const UPSTREAM = 'player.upstream';
const DOWNSTREAM = 'player.downstream';

var downstreamQueue = (mq, uuid) => {
  var prefix = `${DOWNSTREAM}.${uuid}`;
  var queue = mq.queue(prefix);
  queue.bind(DOWNSTREAM, `${prefix}.#`);

  return queue;
};

var responseCmd = (routing) => {
  return routing.split('.')[3];
};

class PlayerQueue {
  constructor(mq, uuid, callback) {
    this.uuid = uuid;
    this.mq = mq;

    // setup downstream responses queue, with receive callback
    this.pq = downstreamQueue(mq, uuid);
    this.pq.consume((msg) => { this.receive(msg, callback); });
  }

  request(topic, msg) {
    if (!msg) { msg = {}; }
    var route = `${UPSTREAM}.${this.uuid}.${topic}`;

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

module.exports = PlayerQueue;
