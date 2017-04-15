import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import * as messages from '../common/messages';

export default class WebSocketClient {
  private readonly socket = socketIo('https://peercast-yp-proxy.now.sh');

  readonly error = new Observable((subscribe) => {
    Observable.fromEvent(this.socket, 'connect_error').subscribe(subscribe);
    Observable.fromEvent(this.socket, 'error').subscribe(subscribe);
    Observable.fromEvent(this.socket, 'reconnect_error').subscribe(subscribe);
  });
  readonly message = Observable.fromEvent<messages.Message>(this.socket, 'message');

  close() { this.socket.close(); }
}
