import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import Users from '/imports/api/users';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/user';

// Corresponding html file
import './uxPages.html';

Template.uxIndexPortal.onCreated(() => {
  Session.set('searchVaults', '');
});

Template.uxIndexPortal.events({
  'input #searchVaults': (event) => {
    Session.set('searchVaults', event.currentTarget.value);
  },
  'submit .js-suppress-submit'(event) {
    window.$('#searchVaults').select();
    event.preventDefault();
  },
});

Template.uxIndexGraph.onCreated(() => {});

Template.uxIndexGraph.helpers({});

Template.uxIndexGraph.onRendered(() => {});

Template.uxIndexGraph.events({});

Template.uxServerConnection.onCreated(() => {});

Template.uxServerConnection.helpers({});

Template.uxServerConnection.onRendered(() => {});

Template.uxServerConnection.events({});

Template.uxInsufficientFunds.onCreated(() => {
  Meteor.subscribe('users');
  const template = Template.instance();
  template.isRegistered = new ReactiveVar(false);
  store.subscribe(() => {
    const currentState = store.getState().user;
    template.isRegistered.set(currentState.isRegistered);
  });
});

Template.uxInsufficientFunds.helpers({
  unregistered: () => !Template.instance().isRegistered.get(),
});
Template.uxInsufficientFunds.events({
  'submit form.js-email': (event, templateInstance) => {
    event.preventDefault();
    const email = templateInstance.find('input#userEmail').value;
    const address = Session.get('selectedAccount');
    store.dispatch(creators.register(email, address));
  },
});
