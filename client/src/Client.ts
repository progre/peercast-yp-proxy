// import * as debugStatic from 'debug';
// const debug = debugStatic('peercast-yp-proxy:Client');
import { Channel } from 'peercast-yp-channels-parser';
import { Observable, Subject } from 'rxjs';
import * as socketIo from 'socket.io-client';
import * as messages from './common/messages';
import MessageClient from './MessageClient';

export default class Client {
  private socket = socketIo('https://peercast-yp-proxy.now.sh');
  private readonly proxyClient = new MessageClient();

  readonly channelsUpdated: Observable<ReadonlyArray<Channel>>
  = this.proxyClient.channelsUpdated;
  readonly differencesReceived: Observable<ReadonlyArray<messages.Difference>>
  = this.proxyClient.differencesReceived;
  readonly error: Observable<Error>;

  constructor() {
    const error = new Subject();
    Observable.fromEvent(this.socket, 'connect_error').subscribe(error);
    Observable.fromEvent(this.socket, 'error').subscribe(error);
    Observable.fromEvent(this.socket, 'reconnect_error').subscribe(error);

    Observable.fromEvent<messages.Message>(this.socket, 'message')
      .filter<messages.BroadcastMessage>(x => x.type === 'broadcast')
      .map(x => x.payload)
      .subscribe(
      x => this.proxyClient.putMessage(x),
      e => error.next(e),
    );
    this.error = error;
  }

  close() {
    this.socket.close();
  }

  getChannels() {
    return this.proxyClient.channels.concat();
  }
}
