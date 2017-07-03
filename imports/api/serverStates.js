import os from 'os';
import pify from 'pify';
import { Mongo } from 'meteor/mongo';

import web3 from '/imports/lib/web3';
import { networkMapping } from '/imports/melon/interface/helpers/specs';

const ServerStates = new Mongo.Collection('serverStates');

ServerStates.watch = () => {
  const hostname =
    process.env.KADIRA_OPTIONS_HOSTNAME || os.hostname() || 'unknown';

  web3.eth.filter('latest').watch(async () => {
    const network =
      networkMapping[await pify(web3.version.getNetwork)()] ||
      web3.version.getNetwork;
    const currentBlock = await pify(web3.eth.getBlockNumber)();
    const disableSync = !!Meteor.settings.public.disableSync;
    const appId = process.env.APP_ID;
    const nodeEnv = process.env.NODE_ENV;
    const rootURL = process.env.ROOT_URL;
    const galaxyAppId = process.env.GALAXY_APP_ID;

    ServerStates.upsert(
      { hostname },
      {
        hostname,
        network,
        currentBlock,
        disableSync,
        appId,
        nodeEnv,
        rootURL,
        galaxyAppId,
      },
    );
  });
};

export default ServerStates;
