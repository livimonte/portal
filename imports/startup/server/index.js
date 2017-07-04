import { Meteor } from 'meteor/meteor';

// Syncs all the collections according to the blockchain state
import '/imports/startup/server/sync-collections';

// Helper Method to determine if server is connected
import '/imports/api/methods/isServerConnected';

console.log('SERVER STARTUP', Meteor.settings, process.env);
