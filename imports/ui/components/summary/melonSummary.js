import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Components
import '/imports/ui/components/ux/uxSpinner';
// Collections
import Vaults from '/imports/api/vaults';
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/summary';

// Corresponding html file
import './melonSummary.html';

Template.melonSummary.onCreated(() => {
  const template = Template.instance();
  template.readyState = new ReactiveVar();
  template.ranking = new ReactiveVar();
  store.subscribe(() => {
    const currentState = store.getState().web3;
    template.readyState.set(currentState.readyState);
    const summaryState = store.getState().summary;
    template.ranking.set(summaryState.ranking);
  });
  store.dispatch(
    creators.requestInformations(Session.get('selectedAccount')),
  );
});

Template.melonSummary.helpers({
  isReady: () => Template.instance().readyState.get() === 'Ready',
  getNetworkStatus: () => {
    const readyState = Template.instance().readyState.get();
    const networkStatus = Session.get('NetworkStatus');

    return networkStatus.isMining ? 'Sending ...' : readyState;
  },
  getRanking() {
    return Template.instance().ranking.get();
  },
});

Template.melonSummary.onRendered(() => { });

Template.melonSummary.events({});
