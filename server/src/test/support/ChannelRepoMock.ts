import { Channel } from 'peercast-yp-channels-parser';
import { Subject } from 'rxjs';
import { Difference } from '../../common/messages';

export default class ChannelRepoMock {
  channels: ReadonlyArray<Channel> = [{
    name: '',
    id: '',
    ip: '',
    url: '',
    genre: '',
    desc: '',
    bandwidthType: '',
    listeners: -1,
    relays: -1,
    bitrate: 0,
    type: '',
    track: {
      creator: '',
      album: '',
      title: '',
      url: '',
    },
    createdAt: 0,
    comment: '',
    direct: false,
  }];

  readonly updated = new Subject<Difference[]>();
}
