import { Channel } from 'peercast-yp-channels-parser';

export type Message = BroadcastMessage | { type: string };

export interface BroadcastMessage {
  readonly type: 'broadcast';
  readonly payload: SharingData;
}

export type SharingData = ChannelsSharingData | DirectivesSharingData;

export interface ChannelsSharingData {
  readonly type: 'channels';
  readonly payload: ReadonlyArray<Channel>;
}

export interface DirectivesSharingData {
  readonly type: 'directives';
  readonly payload: ReadonlyArray<Directive>;
}

export interface Directive {
  readonly type: 'set' | 'delete';
  readonly date: Date;
  readonly channel: Channel;
}
