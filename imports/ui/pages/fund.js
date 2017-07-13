import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import Vaults from '/imports/api/vaults';
import '/imports/ui/components/portfolio/portfolioOverview';
import '/imports/ui/components/portfolio/portfolioContents';
import '/imports/ui/components/portfolio/manageParticipation';
import './fund.html';

Template.fund.onCreated(() => {
  const instance = Template.instance();
  Meteor.subscribe('vaults');
  Meteor.subscribe('assets', FlowRouter.getParam('address'));

  instance.fundExisting = () => {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return !(doc === undefined || address === undefined);
  };

  instance.fundLoadingTimeout = new ReactiveVar(
    window.setTimeout(() => {
      instance.fundLoadingTimeout.set(false);
    }, 10000),
  );
});

Template.fund.helpers({
  loading() {
    const instance = Template.instance();
    return !instance.fundExisting() && !!instance.fundLoadingTimeout.get();
  },
  fundExisting: () => Template.instance().fundExisting(),
  isVisitor: () => Template.instance().data.visit,
});

Template.fund.onRendered(() => {
  const address = FlowRouter.getParam('address');
  const doc = Vaults.findOne({ address });
  if (doc) {
    Meteor.call('vaults.syncVaultById', doc.id);
    Meteor.call('assets.sync', address);
  }
});
