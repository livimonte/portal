// @flow
import BigNumber from 'bignumber.js';
import type { Networks, DerivedState, State } from '../web3.js';

const isNetworkSupported = (network: Networks): boolean =>
  ['Kovan'].includes(network);

const getReadyState = (state: State): DerivedState => {
  const balance = new BigNumber(state.balance);
  // we accept the server to be one block ahead/behind, but not more
  const isServerConnected =
    Math.abs(state.currentBlock - state.currentBlockServer) <= 1;

  if (
    balance.gt(0) &&
    isNetworkSupported(state.network) &&
    state.account &&
    state.isConnected &&
    isServerConnected
  ) {
    return {
      readyState: 'Ready',
      isReady: true,
      isServerConnected,
    };
  } else if (
    isNetworkSupported(state.network) &&
    state.account &&
    state.isConnected &&
    isServerConnected
  ) {
    return {
      readyState: 'Insufficient Fund',
      isReady: false,
      isServerConnected,
    };
  } else if (state.account && state.isConnected && isServerConnected) {
    return {
      readyState: 'Unsupported Network',
      isReady: false,
      isServerConnected,
    };
  } else if (state.isConnected && isServerConnected) {
    return {
      readyState: 'No Account Selected',
      isReady: false,
      isServerConnected,
    };
  } else if (isServerConnected) {
    return {
      readyState: 'Client Not Connected',
      isReady: false,
      isServerConnected,
    };
  } else if (!isServerConnected) {
    return {
      readyState: 'Server Not Connected',
      isReady: false,
      isServerConnected,
    };
  }

  return {
    readyState: 'Server Connected',
    isReady: false,
    isServerConnected,
  };
};

export default getReadyState;
