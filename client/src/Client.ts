// import * as debugStatic from 'debug';
// const debug = debugStatic('peercast-yp-proxy:Client');
import { Channel } from 'peercast-yp-channels-parser';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { deepEqualOrCreatedAtNearTime } from './common/channelutils';
import * as messages from './common/messages';

export default class Client {
  private channels: ReadonlyArray<Channel> = [];
  private socket = socketIo('https://peercast-yp-proxy.now.sh');

  readonly channelsUpdated: Observable<ReadonlyArray<Channel>>;
  readonly differencesReceived: Observable<ReadonlyArray<messages.Difference>>;
  readonly error: Observable<Error>;

  constructor() {
    this.error = new Observable((subscribe) => {
      Observable.fromEvent(this.socket, 'connect_error').subscribe(subscribe);
      Observable.fromEvent(this.socket, 'error').subscribe(subscribe);
      Observable.fromEvent(this.socket, 'reconnect_error').subscribe(subscribe);
    });

    const broadcasted = Observable.fromEvent<messages.Message>(this.socket, 'message')
      .filter<messages.BroadcastMessage>(x => x.type === 'broadcast')
      .map(x => x.payload)
      .publish();
    this.channelsUpdated = broadcasted
      .filter<messages.ChannelsSharingData>(x => x.type === 'channels')
      .map(x => x.payload);
    this.differencesReceived = broadcasted
      .filter<messages.DifferencesSharingData>(x => x.type === 'differences')
      .map(x => x.payload);
    this.channelsUpdated.subscribe(
      (x) => { this.channels = x; },
      e => console.error(e.stack || e),
    );
    this.differencesReceived.subscribe(
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