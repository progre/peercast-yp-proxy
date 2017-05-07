import * as socketIO from 'socket.io';
import ChannelRepo from './ChannelRepo';
import Server from './Server';

// tslint:disable-next-line:no-unused-new
new Server(socketIO(80), new ChannelRepo());
