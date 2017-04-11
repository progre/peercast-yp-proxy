import { Channel } from 'peercast-yp-channels-parser';

export type Message = BroadcastMessage | { type: string };

export interface BroadcastMessage {
  readonly type: 'broadcast';
  readonly payload: SharingData;
}

export type SharingData = ChannelsSharingData | DifferencesSharingData;

export interface ChannelsSharingData {
  readonly type: 'channels';
  readonly payload: ReadonlyArray<Channel>;
}

export interface DifferencesSharingData {
  readonly type: 'differences';
  readonly payload: ReadonlyArray<Difference>;
}

export interface Difference {
  readonly type: 'set' | 'delete';
  readonly date: Date;
  readonly channel: Channel;
}
