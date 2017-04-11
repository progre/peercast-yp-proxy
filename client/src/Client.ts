// import * as debugStatic from 'debug';
// const debug = debugStatic('peercast-yp-proxy:Client');
import { Channel } from 'peercast-yp-channels-parser';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { deepEqualOrCreatedAtNearTime } from './common/channelutils';
import * as messages from './common/messages';

export default class Client {
  readonly channelsUpdated: Observable<ReadonlyArray<Channel>>;
  readonly differenecesReceived: Observable<ReadonlyArray<messages.Difference>>;
  private channels: ReadonlyArray<Channel>;
  private socket = socketIo('https://peercast-yp-proxy.now.sh');

  constructor() {
    Observable.merge<Error>(
      Observable.fromEvent(this.socket, 'connect_error'),
      Observable.fromEvent(this.socket, 'reconnect_error'),
    ).subscribe((e) => {
      console.error(e.stack || e);
    });
    const broadcasted = Observable.fromEvent<messages.Message>(this.socket, 'message')
      .filter<messages.BroadcastMessage>(x => x.type === 'broadcast')
      .map(x => x.payload)
      .publish();
    this.channelsUpdated = broadcasted
      .filter<messages.ChannelsSharingData>(x => x.type === 'channels')
      .map(x => x.payload);
    this.differenecesReceived = broadcasted
      .filter<messages.DifferencesSharingData>(x => x.type === 'differences')
      .map(x => x.payload);
    this.channelsUpdated.subscribe(
      (x) => { this.channels = x; },
      e => console.error(e.stack || e),
    );
    this.differenecesReceived.subscribe(
      (differences) => {
        this.channels = merge(this.channels, differences);
      },
      e => console.error(e.stack || e),
    );
    broadcasted.connect();
  }

  close() {
    this.socket.close();
  }

  getChannels() {
    return this.channels.concat();
  }
}

function merge(channels: ReadonlyArray<Channel>, differences: ReadonlyArray<messages.Difference>) {
  // tslint:disable:no-param-reassign
  for (const difference of differences) {
    switch (difference.type) {
      case 'set':
        channels = channels
          .filter(x => x.id !== difference.channel.id)
          .concat([difference.channel]);
        break;
      case 'delete':
        channels = channels
          .filter(channel => !deepEqualOrCreatedAtNearTime(channel, difference.channel));
        break;
      default:
        throw new Error(`Invalid type: ${difference.type}`);
    }
  }
  return channels;
  // tslint:enable:no-param-reassign
}