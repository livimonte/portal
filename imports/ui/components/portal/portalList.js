import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import Vaults from '/imports/api/vaults';

import './portalList.html';

import { ReactiveVar } from 'meteor/reactive-var';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/user';

Template.portalList.onCreated(() => {
  Meteor.subscribe('vaults');
  const template = Template.instance();
  template.aumSort = new ReactiveVar(-1);
  template.sharePriceSort = new ReactiveVar(-1);
  store.subscribe(() => {
    const currentState = store.getState().user;
    template.aumSort.set(currentState.aumSort);
    template.sharePriceSort.set(currentState.sharePriceSort);
  });
});

Template.portalList.helpers({
  searchedVaults: () => {
    const aumSort = Template.instance().aumSort.get();
    const sharePriceSort = Template.instance().sharePriceSort.get();
    console.log({ aumSort, sharePriceSort });
    return Vaults.find(
      { name: { $regex: `.*${Session.get('searchVaults')}.*`, $options: 'i' } },
      { sort: { sharePrice: sharePriceSort, nav: aumSort, createdAt: -1 } },
    );
  },
  getVaultLink: address =>
    Template.instance().data.main() === 'visit'
      ? `/visit/${address}`
      : `/fund/${address}`,
});

Template.portalList.onRendered(() => {});

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
