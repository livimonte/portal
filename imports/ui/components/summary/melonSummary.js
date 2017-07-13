import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Components
import '/imports/ui/components/ux/uxSpinner';
// Collections
import Vaults from '/imports/api/vaults';
import store from '/imports/startup/client/store';
// Corresponding html file
import './melonSummary.html';

Template.melonSummary.onCreated(() => {
  const template = Template.instance();
  template.readyState = new ReactiveVar();

  store.subscribe(() => {
    const currentState = store.getState().web3;
    template.readyState.set(currentState.readyState);
  });
});

Template.melonSummary.helpers({
  isReady: () => Template.instance().readyState.get() === 'Ready',
  getNetworkStatus: () => {
    const readyState = Template.instance().readyState.get();
    const networkStatus = Session.get('NetworkStatus');

    return networkStatus.isMining ? 'Sending ...' : readyState;
  },
  getRanking() {
    const numberOfVaults = Vaults.find().count();
    let coreAddress = FlowRouter.getParam('address');

    if (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0) {
      coreAddress = Vaults.findOne({ owner: Session.get('selectedAccount') })
        .address;
      const sortedVaults = Vaults.find(
        {},
        { sort: { sharePrice: -1, createdAt: -1 } },
      ).fetch();
      let ranking;
      for (let i = 0; i < sortedVaults.length; i++) {
        if (coreAddress == sortedVaults[i].address) {
          ranking = i + 1;
          break;
        }
      }
      return `${ranking} out of ${numberOfVaults}`;
    }
    return 'No ranking available.';
  },
});

Template.melonSummary.onRendered(() => {});

Template.melonSummary.events({});
