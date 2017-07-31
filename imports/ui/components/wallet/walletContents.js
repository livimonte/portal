import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

// Smart Contracts
import contract from 'truffle-contract';
import EtherTokenJson from '@melonproject/protocol/build/contracts/EtherToken.json';

import web3 from '/imports/lib/web3/client';
// Collections
import Assets from '/imports/api/assets';
import specs from '/imports/melon/interface/helpers/specs';

// Corresponding html file
import './walletContents.html';

Template.walletContents.onCreated(() => {
  Meteor.subscribe('assets', FlowRouter.getParam('address'));
});

Template.walletContents.helpers({
  assets() {
    const assetHolderAddress = FlowRouter.getParam('address');
    return Assets.find({ holder: assetHolderAddress }, { sort: { name: 1 } });
  },
  address() {
    return FlowRouter.getParam('address');
  },
  convertFromTokenPrecision(value) {
    if (Object.keys(this).length === 0) return '';
    const precision = this.precision;
    const divisor = Math.pow(10, precision);
    return (value / divisor).toFixed(4);
  },
  convertTo18Precision(value) {
    if (Object.keys(this).length === 0) return '';
    const precision = this.precision;
    const multiplier = Math.pow(10, 18 - precision);
    return parseFloat(value, 10) * multiplier;
  },
  invertValue(value) {
    // TODO fix function naming
    return web3.toWei(1.0 / parseFloat(value, 10), 'ether');
  },
  portfolioPercentrage() {
    return 'N/A';
  },
  change24h() {
    switch (this.name) {
      case 'Ether Token':
        return Session.get('ethChange24h');
      case 'Melon Token':
        return Session.get('mlnChange24h');
      case 'Bitcoin Token':
        return Session.get('btcChange24h');
      case 'Rep Token':
        return Session.get('repChange24h');
      case 'Euro Token':
        return Session.get('eurChange24h');
      default:
        return 'N/A';
    }
  },
});

Template.walletContents.onRendered(() => {
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address);
});

Template.walletContents.events({
  'click .js-convert-to-keth': (event) => {
    // Prevent default browser form submit
    event.preventDefault();

    const EtherToken = contract(EtherTokenJson);
    EtherToken.setProvider(web3.currentProvider);
    const assetAddress = specs.getTokenAddress('ETH-T');
    const assetHolderAddress = FlowRouter.getParam('address');

    const vault = Assets.findOne(
      { address: assetAddress, holder: assetHolderAddress },
      { sort: { createdAt: -1 } },
    );
    if (vault === undefined) return '';
    const holdings = parseInt(vault.holdings, 10);
    if (holdings === 0) {
      toastr.error('All ETH Token already converted', 'Error', 'blue');
    } else {
      console.log(`Holdings: ${holdings}`);
      EtherToken.at(assetAddress).withdraw(holdings, { from: assetHolderAddress }).then((result) => {
        Session.set('NetworkStatus', {
          isInactive: false,
          isMining: false,
          isError: false,
          isMined: true,
        });
        console.log(`Tx Hash: ${result}`, result);
        Meteor.call('assets.sync', assetHolderAddress); // Upsert Assets Collection
        toastr.success('All ETH Token converted', 'Success', 'green');
      });
    }
  },
});
