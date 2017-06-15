import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import select2 from 'select2';
import contract from 'truffle-contract';
import BigNumber from 'bignumber.js';
// Contracts
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json'; // Get Smart Contract JSON
import EtherTokenJson from '@melonproject/protocol/build/contracts/EtherToken.json';

import web3 from '/imports/lib/web3/client';
import addressList from '/imports/melon/interface/addressList';
// Collections
import Vaults from '/imports/api/vaults';
// Interface
import subscribe from '/imports/melon/interface/subscribe';
import redeem from '/imports/melon/interface/redeem';

import './manageParticipation.html';
// Redux
import { creators } from '/imports/redux/melonInterface';
import store from '/imports/startup/client/store';

const Vault = contract(VaultJson); // Set Provider

Template.manageParticipation.onCreated(() => {
  // TODO update vaults param
  Meteor.subscribe('vaults');
  Template.instance().typeValue = new ReactiveVar(0);
});

Template.manageParticipation.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  formattedSharePrice() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    if (doc !== undefined) {
      if (!doc.sharePrice) return 1;
      return web3.fromWei(doc.sharePrice, 'ether');
    }
  },
  selectedTypeName() {
    switch (Template.instance().typeValue.get()) {
      case 0: return 'Invest';
      case 1: return 'Redeem';
      default: return 'Error';
    }
  },
});

Template.manageParticipation.onRendered(() => {
  $('select').select2();
});

Template.manageParticipation.events({
  'change select#type': (event, templateInstance) => {
    const currentlySelectedTypeValue = parseFloat(templateInstance.find('select#type').value, 10);
    Template.instance().typeValue.set(currentlySelectedTypeValue);
  },
  'input input#price': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    if (!isNaN(volume)) templateInstance.find('input#total').value = price * volume;
    else if (!isNaN(total)) templateInstance.find('input#volume').value = total / price;
  },
  'input input#volume': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value || 0, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value || 0, 10);
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    templateInstance.find('input#total').value = price * volume;
  },
  'input input#total': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    templateInstance.find('input#volume').value = total / price;
  },
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from template instance
    const type = parseFloat(templateInstance.find('select#type').value, 10);
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    if (isNaN(type) || isNaN(price) || isNaN(volume) || isNaN(total)) {
      // TODO replace toast
      // Materialize.toast('Please fill out the form', 4000, 'blue');
      return;
    }

    // Init
    const managerAddress = Session.get('selectedAccount');
    if (managerAddress === undefined) {
      // TODO replace toast
      // Materialize.toast('Not connected, use Parity, Mist or MetaMask', 4000, 'blue');
      return;
    }
    const coreAddress = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address: coreAddress });
    // Check if core is stored in database
    if (doc === undefined) {
      // TODO replace toast
      // Materialize.toast(`Portfolio could not be found\n ${coreAddress}`, 4000, 'red');
      return;
    }

    const coreContract = Vault.at(coreAddress);
    Vault.setProvider(web3.currentProvider);

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    const EtherToken = contract(EtherTokenJson);
    EtherToken.setProvider(web3.currentProvider);
    const EtherTokenContract = EtherToken.at(addressList.etherToken);

    switch (type) {
      // Invest case
      case 0:
        const quantityAsked = new BigNumber(templateInstance.find('input#volume').value).times(Math.pow(10, 18));
        const quantityOffered = new BigNumber(templateInstance.find('input#total').value).times(Math.pow(10, 18));

        console.log(doc.id, managerAddress, coreAddress, quantityAsked.toString(), quantityOffered.toString());

        store.dispatch(creators.subscribeToFund(doc.id, managerAddress, coreAddress, quantityAsked, quantityOffered));

        // subscribe(doc.id, managerAddress, coreAddress, quantityAsked, quantityOffered)
        // .then((result) => {
        //   console.log(result);
          // Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
          // toastr.success('Shares successfully created!');
        //   console.log('Shares successfully created.');
        //   Meteor.call('assets.sync', coreAddress);
        //   Meteor.call('vaults.syncVaultById', doc.id);
        // })
        // .catch((error) => {
        //   console.log(error);
        //   Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
        //   toastr.error('Oops, an error has occured. Please verify that your holdings allow you to invest in this fund!');
        // });
        // EtherTokenContract.deposit({ from: managerAddress, value: weiTotal }).then(result => EtherTokenContract.approve(coreAddress, weiVolume, { from: managerAddress })).then(result => coreContract.createShares(weiVolume, { from: managerAddress })).then((result) => {
        //   Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        //   toastr.success('Shares successfully created!');
        //   console.log(`Shares successfully created. Tx Hash: ${result}`);
        //   Meteor.call('assets.sync', coreAddress); // Upsert Assets Collection
        //   Meteor.call('vaults.syncVaultById', doc.id);
        //   return coreContract.totalSupply();
        // }).catch((error) => {
        //   console.log(error);
        //   Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
        //   toastr.error('Oops, an error has occured. Please verify that your holdings allow you to invest in this fund!');
        // });
        // templateInstance.find('input#total').value = '';
        // templateInstance.find('input#volume').value = '';
        window.scrollTo(0, 0);
        break;


      // Redeem case
      case 1:
        coreContract.annihilateShares(weiVolume, weiTotal, { from: managerAddress }).then((result) => {
          Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
          toastr.success('Shares successfully redeemed!');
          console.log(`Shares annihilated successfully. Tx Hash: ${result}`);
          Meteor.call('assets.sync', coreAddress); // Upsert Assets Collection
          templateInstance.find('input#total').value = '';
          templateInstance.find('input#volume').value = '';
          return coreContract.totalSupply();
        }).catch((error) => {
          console.log(error);
          Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
          toastr.error('Oops, an error has occured. Please try again.');
        });
      default: return 'Error';
    }
  },
});
