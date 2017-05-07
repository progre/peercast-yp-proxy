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
    client.close();
  });

  it('can accept many clients', async () => {
    const clients: Client[] = [];
    for (let i = 0; i < 100; i += 1) {
      clients.push(new Client(`http://127.0.0.1:${PORT}`));
    }
    await Promise.all(
      clients.map(client => (
        client.channelsUpdated.first().toPromise().then(() => client)
      )),
    );
    assert(clients.every(x => x.getChannels().length > 0));
  });
});
