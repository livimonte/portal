// @flow
import { OrderedMap } from 'immutable';
import BigNumber from 'bignumber.js';
import type {
  Networks,
    ObservedState,
    DerivedState,
    ReadyState,
    State,
} from '../web3.js';

const ACCEPTED_BLOCK_DISCREPANCY = 5;

const isNetworkSupported = (network: Networks): boolean =>
  ['Kovan'].includes(network);

const stateMap: OrderedMap<ReadyState, Function> = OrderedMap({
  Loading: () => false,
  'Client Not Connected': (state: State) => !state.isConnected,
  'No Account Selected': (state: State) => !state.account,
  'Server Not Connected': (state: State) => !state.isServerConnected,
  'Unsupported Network': (state: State) => !isNetworkSupported(state.network),
  'Insufficient Fund': (state: State) => new BigNumber(state.balance).lte(0),
  Ready: () => true,
});

const getReadyState = (observedState: ObservedState): DerivedState => {
  const derivedState: State = {
    ...observedState,
    // we accept the server to be one block ahead/behind, but not more
    isServerConnected:
    Math.abs(
      observedState.currentBlock - observedState.currentBlockWebServer,
    ) <= ACCEPTED_BLOCK_DISCREPANCY &&
    Math.abs(
      observedState.currentBlock - observedState.currentBlockSyncServer,
    ) <= ACCEPTED_BLOCK_DISCREPANCY &&
    Math.abs(
      observedState.currentBlockWebServer -
      observedState.currentBlockSyncServer,
    ) <= ACCEPTED_BLOCK_DISCREPANCY,
  };
  const readyState = stateMap.findKey(value => value(derivedState));

  return {
    readyState,
    isServerConnected: derivedState.isServerConnected,
    isReady: readyState === 'Ready',
  };
};

export default getReadyState;
