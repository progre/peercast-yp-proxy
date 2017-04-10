// import * as debugStatic from 'debug';
// const debug = debugStatic('peercast-yp-proxy:Client');
import { Channel } from 'peercast-yp-channels-parser';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import * as messages from './common/messages';

export default class Client {
  readonly channelsUpdated: Observable<ReadonlyArray<Channel>>;
  readonly directivesReceived: Observable<ReadonlyArray<messages.Directive>>;
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
    broadcasted.subscribe(console.log, console.error);
    this.channelsUpdated = broadcasted
      .filter<messages.ChannelsSharingData>(x => x.type === 'channels')
      .map(x => x.payload);
    this.directivesReceived = broadcasted
      .filter<messages.DirectivesSharingData>(x => x.type === 'directives')
      .map(x => x.payload);
    broadcasted.connect();
  }

  close() {
    this.socket.close();
  }
}
