import { Channel } from 'peercast-yp-channels-parser';

export function deepEqualOrCreatedAtNearTime(
  a: Channel,
  b: Channel,
) {
  if (
    a.name !== b.name ||
    a.id !== b.id ||
    a.ip !== b.ip ||
    a.url !== b.url ||
    a.genre !== b.genre ||
    a.desc !== b.desc ||
    a.bandwidthType !== b.bandwidthType ||
    a.listeners !== b.listeners ||
    a.relays !== b.relays ||
    a.bitrate !== b.bitrate ||
    a.type !== b.type ||
    a.track.creator !== b.track.creator ||
    a.track.album !== b.track.album ||
    a.track.title !== b.track.title ||
    a.track.url !== b.track.url ||
    // createdAt isn't checked.
    a.comment !== b.comment ||
    a.direct !== b.direct
  ) {
    return false;
  }
  // difference of 2 minutes or more
  if (
    Math.abs(a.createdAt - b.createdAt)
    > 2 * 60 * 1000
  ) {
    return false;
  }
  return true;
}
