import * as socketIo from 'socket.io';
import ChannelRepo from './ChannelRepo';

const io = socketIo(80);
const channelRepo = new ChannelRepo();
channelRepo.updated.subscribe(
  (directives) => {
    io.send({
      type: 'broadcast',
      payload: {
        type: 'directives',
        payload: directives,
      },
    });
  },
  e => console.error(e.stack || e),
);

io.on('connect', (socket) => {
  socket.send({
    type: 'broadcast',
    payload: {
      type: 'channels',
      payload: channelRepo.channels,
    },
  });
});
