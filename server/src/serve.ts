import * as socketIO from 'socket.io';
import Server from './domain/Server';
import ChannelRepo from './infrastructure/ChannelRepo';

// tslint:disable-next-line:no-unused-new
new Server(socketIO(80), new ChannelRepo());
