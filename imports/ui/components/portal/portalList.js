import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import Vaults from '/imports/api/vaults';

import './portalList.html';

import { ReactiveVar } from 'meteor/reactive-var';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/user';
import { creators as vaultCreators } from '/imports/redux/vault';


Template.portalList.onCreated(() => {
  Meteor.subscribe('vaults');
  const template = Template.instance();
  template.aumSort = new ReactiveVar(-1);
  template.sharePriceSort = new ReactiveVar(-1);
  template.prioritySorting = new ReactiveVar('sharePriceSort');
  store.subscribe(() => {
    const currentState = store.getState().user;
    template.aumSort.set(currentState.aumSort);
    template.sharePriceSort.set(currentState.sharePriceSort);
    template.prioritySorting.set(currentState.prioritySorting);
  });
});

Template.portalList.helpers({
  searchedVaults: () => {
    const aumSort = Template.instance().aumSort.get();
    const sharePriceSort = Template.instance().sharePriceSort.get();
    const prioritySorting = Template.instance().prioritySorting.get();
    if (prioritySorting === 'sharePriceSort') {
      return Vaults.find(
        {
          name: { $regex: `.*${Session.get('searchVaults')}.*`, $options: 'i' },
        },
        { sort: { sharePrice: sharePriceSort, nav: aumSort, createdAt: -1 } },
      );
    }
    return Vaults.find(
      {
        name: { $regex: `.*${Session.get('searchVaults')}.*`, $options: 'i' },
      },
      { sort: { nav: aumSort, sharePrice: sharePriceSort, createdAt: -1 } },
    );
  },
  getVaultLink: address =>
    Template.instance().data.main() === 'visit'
      ? `/visit/${address}`
      : `/fund/${address}`,
  getRanking: (index) => index + 1,
});

Template.portalList.onRendered(() => { });

Template.portalList.events({
  'click .js-AUM-asc': () => {
    store.dispatch(creators.sortAUM(1));
  },
  'click .js-AUM-desc': () => {
    store.dispatch(creators.sortAUM(-1));
  },
  'click .js-sharePrice-asc': () => {
    store.dispatch(creators.sortSharePrice(1));
  },
  'click .js-shareprice-desc': () => {
    store.dispatch(creators.sortSharePrice(-1));
  },
});
