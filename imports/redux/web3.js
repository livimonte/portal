// @flow
import getReadyState from './utils/getReadyState';

export type Providers =
  | "MetaMask"
  | "Mist"
  | "Parity"
  | "LocalNode"
  | "Unknown";
export type Networks = "Rinkeby" | "Ropsten" | "Kovan" | "Main" | "Private";
export type ReadyState =
  | "Loading"
  | "Server Not Connected"
  | "Client Not Connected"
  | "No Account Selected"
  | "Unsupported Network"
  | "Insufficient Fund"
  | "Ready";

type ObservedState = {
  isSynced: boolean,
  isConnected: boolean,
  currentBlock: number,
  balance: string,
  network?: Networks,
  account?: string,
  provider?: Providers,
  // balance in ETH is stored as a string with precision
  // '1.234' and not '1231'
  isServerConnected?: boolean
};

export type DerivedState = {
  readyState: ReadyState,
  isReady: boolean
};

export type State = ObservedState & DerivedState;

export const initialState: State = {
  isSynced: false,
  isConnected: false,
  currentBlock: 0,
  readyState: 'Loading',
  isReady: false,
  balance: '0',
  gasLimit: '3500000',
  isRegistered: false,
};

export const types = {
  UPDATE: 'UPDATE:network:portal.melonport.com',
  REGISTER: 'REGISTER:network:portal.melonport.com',
};

export const creators = {
  update: newState => ({
    type: types.UPDATE,
    ...newState,
  }),
  register: () => ({
    type: types.REGISTER,
  }),
};

export const reducer = (state: State = initialState, action: string) => {
  const { type, ...params } = action;

  switch (type) {
    // simple state updaters
    case types.UPDATE: {
      const newState = {
        ...state,
        ...params,
      };

      return {
        ...newState,
        ...getReadyState(newState),
      };
    }

    case types.REGISTER: {
      return {
        ...state,
        isRegistered: true,
      };
    }

    default:
      return state;
  }
};

export default reducer;
