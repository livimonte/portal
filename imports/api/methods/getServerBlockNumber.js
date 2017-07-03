import os from 'os';
import { Meteor } from 'meteor/meteor';

import ServerStates from '../serverStates';

Meteor.methods({
  getServerBlockNumber() {
    if (Meteor.isClient) return null;
    const hostname =
      process.env.KADIRA_OPTIONS_HOSTNAME || os.hostname() || 'unknown';
    const state = ServerStates.findOne({ hostname });
    return state.currentBlock;
  },
});
