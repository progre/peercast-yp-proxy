import * as debugStatic from 'debug';
debugStatic.enable('peercast-yp-proxy:*');
try { require('source-map-support').install(); } catch (e) { /* NOP */ }
import Client from './Client';
export { Client };
