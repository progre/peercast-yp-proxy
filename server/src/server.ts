import * as socketIo from 'socket.io';
import ChannelRepo from './ChannelRepo';

const io = socketIo(80);
const channelRepo = new ChannelRepo();
channelRepo.updated.subscribe(
  (differences) => {
    io.send({
      type: 'broadcast',
      payload: {
        type: 'differences',
        payload: differences,
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
