import { Meteor } from 'meteor/meteor';
import Vaults from '/imports/api/vaults';
import performCalculations from '/imports/melon/interface/performCalculations';

export const initialState = {
  ranking: undefined,
  fundName: undefined,
  fundAddress: undefined,
  sharePrice: undefined,
};

export const types = {
  REQUEST_INFORMATIONS: 'REQUEST_INFORMATIONS:summary:portal.melonport.com',
  UPDATE_INFORMATIONS: 'UPDATE_INFORMATIONS:summary:portal.melonport.com',
};

export const creators = {
  requestInformations: managerAddress => ({
    type: types.REQUEST_INFORMATIONS,
    managerAddress,
  }),
  updateInformations: informations => ({
    type: types.UPDATE_INFORMATIONS,
    ...informations,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;
  switch (type) {
    case types.REQUEST_INFORMATIONS: {
      return state;
    }
    case types.UPDATE_INFORMATIONS: {
      return {
        ...state,
        ...params,
      };
    }
    default:
      return state;
  }
};

export const middleware = store => next => (action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.REQUEST_INFORMATIONS: {
      const vault = Vaults.findOne({ owner: params.managerAddress });
      const informations = {};
      if (vault) {
        informations.fundName = vault.name;
        informations.fundAddress = vault.address;

        const numberOfVaults = Vaults.find().count();
        const sortedVaults = Vaults.find(
          {},
          { sort: { sharePrice: -1, createdAt: -1 } },
        ).fetch();
        let ranking;
        for (let i = 0; i < sortedVaults.length; i++) {
          if (vault.address == sortedVaults[i].address) {
            ranking = i + 1;
            break;
          }
        }
        informations.ranking = `${ranking} out of ${numberOfVaults}`;
        performCalculations(vault.address).then((calculations) => {
          informations.sharePrice = calculations.sharePrice.toString();
          store.dispatch(creators.updateInformations(informations));
        });
      } else {
        console.warn('REQUEST_INFORMARTIONS failed, no vault found for this manager',
          params.managerAddress,
        );
      }
      break;
    }

    case types.UPDATE_INFORMATIONS: {
      break;
    }
    default:
  }
  return next(action);
};

export default reducer;
