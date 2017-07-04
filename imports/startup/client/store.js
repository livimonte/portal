import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import {
  default as manageHoldings,
  middleware as manageHoldingsMiddleware,
} from '/imports/redux/manageHoldings';
import {
  default as vault,
  middleware as vaultMiddleware,
} from '/imports/redux/vault';
import web3 from '/imports/redux/web3';
import {
  default as user,
  middleware as userMiddleware,
} from '/imports/redux/user';

// http://redux.js.org/docs/api/createStore.html
export default createStore(
  combineReducers({
    manageHoldings,
    web3,
    vault,
    user,
  }),
  {
    /* preloadedState */
  },
  compose(
    applyMiddleware(manageHoldingsMiddleware, vaultMiddleware, userMiddleware),
    /* eslint-disable no-underscore-dangle */
    window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__()
      : f => f,
    /* eslint-enable */
  ),
);
