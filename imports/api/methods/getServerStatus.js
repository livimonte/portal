import os from 'os';
import { Meteor } from 'meteor/meteor';

import ServerStates from '../serverStates';

Meteor.methods({
  getServerStatus() {
    if (Meteor.isClient) return null;
    const hostname =
      process.env.KADIRA_OPTIONS_HOSTNAME || os.hostname() || 'unknown';
    const webServerState = ServerStates.findOne({ hostname });
    const syncServerQuery = {
      disableSync: false,
      nodeEnv: webServerState.nodeEnv,
      portalVersion: webServerState.portalVersion,
      protocolVersion: webServerState.protocolVersion,
    };
    const syncServerState = ServerStates.findOne(syncServerQuery, {
      sort: { currentBlock: -1 },
    });

    const currentBlockWebServer = webServerState
      ? webServerState.currentBlock
      : 0;
    const currentBlockSyncServer = syncServerState
      ? syncServerState.currentBlock
      : 0;

    if (currentBlockSyncServer === 0) {
      console.warn('No sync server found. Query', syncServerQuery);
    } else if (Math.abs(currentBlockWebServer - currentBlockSyncServer) > 1) {
      console.warn('Sync server and webserver current blocks differ:', {
        syncServerQuery,
        currentBlockWebServer,
        currentBlockSyncServer,
      });
    }

    return {
      currentBlockWebServer,
      currentBlockSyncServer,
    };
  },
});
