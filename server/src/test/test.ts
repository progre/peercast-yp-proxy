import * as assert from 'power-assert';
import * as socketIO from 'socket.io';
import { Client } from '../../../client/';
import Server from '../Server';
import ChannelRepoMock from './support/ChannelRepoMock';

const PORT = 3000;

describe('Server', () => {
  let server: Server;

  before(() => {
    server = new Server(socketIO(PORT), new ChannelRepoMock());
  });

  it('can accept client', async () => {
    const client = new Client(`http://127.0.0.1:${PORT}`);
    await client.channelsUpdated.first().toPromise();
    assert(client.getChannels().length > 0);
  });
});
