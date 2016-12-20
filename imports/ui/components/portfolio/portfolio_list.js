import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
// Smart contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
// Corresponding html file
import './portfolio_list.html';


Template.portfolio_list.onCreated(function portfolioListOnCreated() {
  Session.set('sharePrice', 1);
  Session.set('sumInvested', 0);
  Session.set('sumWithdrawn', 0);
});


Template.portfolio_list.helpers({
});


Template.portfolio_list.events({
  'click .delete'() {
    Meteor.call('portfolios.remove', this._id);
    Materialize.toast('Portfolio deleted!', 4000, 'blue');
  },
});
