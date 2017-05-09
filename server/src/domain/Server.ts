import { Channel } from 'peercast-yp-channels-parser';
import { Observable } from 'rxjs';
import { Difference } from '../common/messages';

interface ChannelRepo {
  channels: ReadonlyArray<Channel>;
  readonly updated: Observable<Difference[]>;
}

export default class Server {
  constructor(private io: SocketIO.Server, private channelRepo: ChannelRepo) {
    this.broadcastDifferences = this.broadcastDifferences.bind(this);
    this.sendChannels = this.sendChannels.bind(this);

    this.io.on('connect', this.sendChannels);
    this.channelRepo.updated.subscribe(
      this.broadcastDifferences,
      e => console.error(e.stack || e),
    );
  }

  private sendChannels(socket: SocketIO.Socket) {
    socket.send({
      type: 'broadcast',
      payload: {
        type: 'channels',
        payload: this.channelRepo.channels,
      },
    });
  }

  private broadcastDifferences(differences: Difference[]) {
    this.io.send({
      type: 'broadcast',
      payload: {
        type: 'differences',
        payload: differences,
      },
    });
  }
}
