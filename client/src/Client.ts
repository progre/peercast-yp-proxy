// import * as debugStatic from 'debug';
// const debug = debugStatic('peercast-yp-proxy:Client');
import { Channel } from 'peercast-yp-channels-parser';
import { Observable, Subject } from 'rxjs';
import * as messages from './common/messages';
import MessageClient from './domain/MessageClient';
import WebSocketClient from './infrastructure/WebSocketClient';

export default class Client {
  private readonly webSocketClient = new WebSocketClient();
  private readonly proxyClient = new MessageClient();

  readonly channelsUpdated: Observable<ReadonlyArray<Channel>>
  = this.proxyClient.channelsUpdated;
  readonly differencesReceived: Observable<ReadonlyArray<messages.Difference>>
  = this.proxyClient.differencesReceived;
  readonly error: Observable<Error>;

  constructor() {
    const error = new Subject();
    this.webSocketClient.error.subscribe(error);

    this.webSocketClient.message
      .filter<messages.BroadcastMessage>(x => x.type === 'broadcast')
      .map(x => x.payload)
      .subscribe(
      x => this.proxyClient.putMessage(x),
      e => error.next(e),
    );
    this.error = error;
  }

  close() {
    this.webSocketClient.close();
  }

  getChannels() {
    return this.proxyClient.channels.concat();
  }
}
