import fetch from 'node-fetch'; // tslint:disable-line:import-name
import { Channel, parse } from 'peercast-yp-channels-parser';
import { Subject } from 'rxjs';
import { deepEqualOrCreatedAtNearTime } from './common/channelutils';
import { Directive } from './common/messages';

// let TP_OSHIRASE = 'TPからのお知らせ◆お知らせ';
// let TP_UPLOAD = 'Temporary yellow Pages◆アップロード帯域';

export default class ChannelRepository {
  channels: ReadonlyArray<Channel> = [];

  readonly updated = new Subject<Directive[]>();

  constructor() {
    setInterval(
      () => this.update().catch((e) => {
        console.error(e.stack || e);
      }),
      10 * 1000,
    );
  }

  private async update() {
    const { date: now, channels: nowChannels } = await fetchChannels();
    const { deleteList, setList } = getDiffList(this.channels, nowChannels);
    this.channels = nowChannels;
    const mergedList = setList
      .map(x => <Directive>{
        type: 'set',
        date: now,
        channel: x,
      })
      .concat(deleteList.map(x => <Directive>{
        type: 'delete',
        date: now,
        channel: x,
      }));
    if (mergedList.length <= 0) {
      return;
    }
    this.updated.next(mergedList);
  }
}

function getDiffList(
  old: ReadonlyArray<Channel>,
  now: ReadonlyArray<Channel>,
) {
  return {
    deleteList: old.filter(x => now.every(y => x.id !== y.id)),
    setList: now.filter(x => old.every(
      y => !deepEqualOrCreatedAtNearTime(x, y),
    )), // include updates
  };
}

async function fetchChannels() {
  const channels = <ReadonlyArray<Channel>>[];
  // tslint:disable-next-line:no-http-string
  const res = await fetch('http://temp.orz.hm/yp/index.txt');
  const now = new Date();
  return {
    date: now,
    channels: <ReadonlyArray<Channel>>channels.concat(parse(await res.text(), now)),
  };
}
