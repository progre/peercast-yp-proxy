import { Channel } from 'peercast-yp-channels-parser';
import { Subject } from 'rxjs';
import { deepEqualOrCreatedAtNearTime } from './common/channelutils';
import * as messages from './common/messages';

export default class Messagelient {
  channels: ReadonlyArray<Channel> = [];

  readonly channelsUpdated = new Subject<ReadonlyArray<Channel>>();
  readonly differencesReceived = new Subject<ReadonlyArray<messages.Difference>>();

  putMessage(message: messages.SharingData) {
    switch (message.type) {
      case 'channels':
        this.channels = message.payload;
        this.channelsUpdated.next(message.payload);
        break;
      case 'differences':
        this.channels = merge(this.channels, message.payload);
        this.differencesReceived.next(message.payload);
        break;
      default:
        throw new Error(`Unsupported message type: ${message}`);
    }
  }
}

function merge(channels: ReadonlyArray<Channel>, differences: ReadonlyArray<messages.Difference>) {
  // tslint:disable:no-param-reassign
  for (const difference of differences) {
    switch (difference.type) {
      case 'set':
        channels = channels
          .filter(x => x.id !== difference.channel.id)
          .concat([difference.channel]);
        break;
      case 'delete':
        channels = channels
          .filter(channel => !deepEqualOrCreatedAtNearTime(channel, difference.channel));
        break;
      default:
        throw new Error(`Invalid type: ${difference.type}`);
    }
  }
  return channels;
  // tslint:enable:no-param-reassign
}
