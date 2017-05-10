import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { ServerMessage } from '../common/messages';

export default class WebSocketClient {
  private readonly socket: SocketIOClient.Socket;

  readonly error = new Observable((subscribe) => {
    Observable.fromEvent(this.socket, 'connect_error').subscribe(subscribe);
    Observable.fromEvent(this.socket, 'error').subscribe(subscribe);
    Observable.fromEvent(this.socket, 'reconnect_error').subscribe(subscribe);
  });
  readonly message: Observable<ServerMessage>;

  constructor(url: string) {
    this.socket = socketIo(url);
    this.message = Observable.fromEvent<ServerMessage>(this.socket, 'message');
  }

  close() { this.socket.close(); }
}
