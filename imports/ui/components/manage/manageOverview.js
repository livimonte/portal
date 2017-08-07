import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { bootstrapSwitch } from 'bootstrap-switch';
// Collections
import Vaults from '/imports/api/vaults';
import Assets from '/imports/api/assets';

import store from '/imports/startup/client/store';

import { ReactiveVar } from 'meteor/reactive-var';

// Specs
import specs from '/imports/melon/interface/helpers/specs';
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';
import {
  getTokenAddress,
  getTokenNameBySymbol,
} from '/imports/melon/interface/helpers/specs';

// Corresponding html file
import './manageOverview.html';

const numberOfQuoteTokens = specs.getQuoteTokens().length;
const numberOfBaseTokens = specs.getBaseTokens().length;

const assetPairs = [...Array(numberOfQuoteTokens * numberOfBaseTokens).keys()]
  .map((value, index) =>
    [
      specs.getBaseTokens()[index % numberOfBaseTokens],
      '/',
      specs.getQuoteTokens()[index % numberOfQuoteTokens],
    ].join(''),
)
  .sort();

FlowRouter.triggers.enter(
  [
    (context) => {
      const doc = Vaults.findOne({ address: context.params.address });
      // TODO: Reactivate this, when we reactivate from portfolio trading
      // Session.set('fromPortfolio', doc !== undefined);
    },
  ],
  { only: ['manage'] },
);

Tracker.autorun(() => {
  const fromPortfolio = Session.get('fromPortfolio');

  if (FlowRouter.getRouteName() === 'manage') {
    const vault = Vaults.findOne({ owner: Session.get('selectedAccount') });

    if (fromPortfolio && vault) {
      FlowRouter.setParams({ address: vault.address });
    }
  }
});

Template.manageOverview.onCreated(() => {
  Meteor.subscribe('vaults');
  Meteor.subscribe('assets', FlowRouter.getParam('address'));
  Meteor.call('assets.sync', FlowRouter.getParam('address'));
  const template = Template.instance();
  template.currentAssetPair = new ReactiveVar(
    store.getState().manageHoldings.currentAssetPair,
  );
  store.subscribe(() => {
    const currentState = store.getState().manageHoldings;
    template.currentAssetPair.set(currentState.currentAssetPair);
  });

  // TODO send command to server to update current vaultContract
});

Template.manageOverview.helpers({
  assetPairs,
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () =>
    Template.instance().currentAssetPair.get().baseTokenSymbol,
  quoteTokenSymbol: () =>
    Template.instance().currentAssetPair.get().quoteTokenSymbol,
  baseTokenName: () =>
    getTokenNameBySymbol(
      Template.instance().currentAssetPair.get().baseTokenSymbol,
    ),
  quoteTokenName: () =>
    getTokenNameBySymbol(
      Template.instance().currentAssetPair.get().quoteTokenSymbol,
    ),
  selected: assetPair =>
    assetPair === Session.get('currentAssetPair') ? 'selected' : '',
  isFromPortfolio: () => (Session.get('fromPortfolio') ? 'checked' : ''),
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    console.log(address);
    const doc = Vaults.findOne({ address });
    return doc === undefined || address === undefined ? '' : doc;
  },
  getStatus() {
    if (Session.get('fromPortfolio')) return 'Manage fund';
    return 'Manage personal wallet';
  },
  getAssetHoldings(symbol) {
    const assetHolderAddress = FlowRouter.getParam('address');
    const tokenAddress = getTokenAddress(symbol);
    const asset = Assets.findOne({
      holder: assetHolderAddress,
      address: tokenAddress,
    });
    if (asset) {
      return convertFromTokenPrecision(asset.holdings, asset.precision);
    }
  },
});

Template.manageOverview.events({
  'change .js-asset-pair-picker': (event) => {
    Session.set('currentAssetPair', event.currentTarget.value);
  },
});
