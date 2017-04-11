// import * as debugStatic from 'debug';
// const debug = debugStatic('peercast-yp-proxy:Client');
import { Channel } from 'peercast-yp-channels-parser';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { deepEqualOrCreatedAtNearTime } from './common/channelutils';
import * as messages from './common/messages';

export default class Client {
  readonly channelsUpdated: Observable<ReadonlyArray<Channel>>;
  readonly directivesReceived: Observable<ReadonlyArray<messages.Directive>>;
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
    this.directivesReceived = broadcasted
      .filter<messages.DirectivesSharingData>(x => x.type === 'directives')
      .map(x => x.payload);
    this.channelsUpdated.subscribe(
      (x) => { this.channels = x; },
      e => console.error(e.stack || e),
    );
    this.directivesReceived.subscribe(
      (directives) => {
        this.channels = merge(this.channels, directives);
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

function merge(channels: ReadonlyArray<Channel>, directives: ReadonlyArray<messages.Directive>) {
  // tslint:disable:no-param-reassign
  for (const directive of directives) {
    switch (directive.type) {
      case 'set':
        channels = channels
          .filter(x => x.id !== directive.channel.id)
          .concat([directive.channel]);
        break;
      case 'delete':
        channels = channels
          .filter(channel => !deepEqualOrCreatedAtNearTime(channel, directive.channel));
        break;
      default:
        throw new Error(`Invalid type: ${directive.type}`);
    }
  }
  return channels;
  // tslint:enable:no-param-reassign
}