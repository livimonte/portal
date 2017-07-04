import pify from 'pify';
import { Meteor } from 'meteor/meteor';

import web3 from '/imports/lib/web3/client';
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/web3';
import { networkMapping } from '/imports/melon/interface/helpers/specs';

import Raven from '/imports/startup/utils/raven';

const CHECK_ACCOUNT_INTERVAL = 4000;

async function updateWeb3() {
  const provider = (() => {
    if (web3.currentProvider.isMetaMask) {
      return 'MetaMask';
    } else if (typeof web3.currentProvider === 'object') {
      return 'LocalNode';
    }
    return 'Unknown';
  })();

  const web3State = {
    isConnected: web3.isConnected(),
    provider,
  };

  try {
    const serverStatus = await pify(Meteor.call)('getServerStatus');
    web3State.currentBlockWebServer = serverStatus.currentBlockWebServer;
    web3State.currentBlockSyncServer = serverStatus.currentBlockSyncServer;

    if (web3State.currentBlockSyncServer === 0) {
      console.warn('Sync server out of sync');
      Raven.captureMessage('Sync server out of sync');
    } else if (web3State.currentBlockWebServer === 0) {
      console.warn('Web server out of sync');
      Raven.captureMessage('Web server out of sync');
    }

    const accounts = await pify(web3.eth.getAccounts)();
    if (accounts.length) {
      const balance = await pify(web3.eth.getBalance)(accounts[0]);
      web3State.account = accounts[0];
      web3State.network = networkMapping[await pify(web3.version.getNetwork)()];
      web3State.balance = balance ? balance.div(10 ** 18).toString() : null;
      web3State.currentBlock = await pify(web3.eth.getBlockNumber)();
      web3State.isSynced = !await pify(web3.eth.getSyncing)();
    } else {
      web3State.account = null;
      web3State.network = null;
      web3State.balance = '0';
      web3State.currentBlock = 0;
    }
  } catch (e) {
    console.warn('Error with web3 connection.', e);
    Raven.captureException(e);
  }

  const previousState = store.getState().web3;
  const needsUpdate = Object.keys(web3State).reduce(
    (accumulator, currentKey) =>
      accumulator || web3State[currentKey] !== previousState[currentKey],
    false,
  );

  if (needsUpdate) store.dispatch(creators.update(web3State));
}

async function checkAccounts() {
  const accounts = await pify(web3.eth.getAccounts)();
  if (accounts.length <= 0) {
    updateWeb3();
  }
  window.setTimeout(checkAccounts, CHECK_ACCOUNT_INTERVAL);
}

// We need to wait for the page load instead of meteor startup
// to be certain that metamask is injected.
window.addEventListener('load', function() {
  /* eslint-disable no-underscore-dangle */
  window.__AppInitializedBeforeWeb3__ = true;
  /* eslint-enable */
  updateWeb3();
  web3.eth.filter('latest').watch(() => {
    updateWeb3();
  });

  // if the user locks metamask `web3.eth.filter` just stops silently
  // that's why we need to check the accounts in parallel
  window.setTimeout(checkAccounts, CHECK_ACCOUNT_INTERVAL);
});
