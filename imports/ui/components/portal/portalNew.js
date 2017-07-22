import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import contract from 'truffle-contract';
import VersionJson from '@melonproject/protocol/build/contracts/Version.json';
// Smart Contracts
import web3 from '/imports/lib/web3/client';
import addressList from '/imports/melon/interface/addressList';
import store from '/imports/startup/client/store';
import './portalNew.html';

const Version = contract(VersionJson);

Template.portalNew.onCreated(() => {
  Session.set('showModal', true);
  Meteor.subscribe('vaults');
  Meteor.subscribe('universes');
});

Template.portalNew.helpers({
  ...addressList,
  // isSelected: () => {
  //   if (this.selected === 'true') {
  //     return true;
  //   }
  //   return false;
  // },
});

Template.portalNew.onRendered(() => { });

Template.portalNew.events({
  'shown.bs.modal #myModal': (event) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
  'change form#new_portfolio #universe_select': (event) => {
    // Get value from form element
    const target = event.target;
    if (target.value === 'melon') {
      // Materialize.toast('Good choice. Now verifiy the accuracy of this registar', 4000, 'blue');
      Session.set('selectedRegistarIsMelon', true);
    }
  },
  // 'change #checkbox': (event, templateInstance) => {
  //   // const x = templateInstance.find('#checkbox').is(':checked').val();
  //   console.log(event.target.checked);
  // },
  'submit form#new_portfolio': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
    Version.setProvider(web3.currentProvider);

    if (!templateInstance.find('input#portfolio_name').value) {
      alert('Please enter a portfolio name.');
      return;
    }
    if (templateInstance.find('#checkbox').checked === false) {
      alert('Sorry, you can\'t take part into the competition if you do not agree to our Terms and Conditions.');
      return;
    }
    // const email = templateInstance.find('input#portfolio_email').value;
    // const managerAddress
    const userInfo = { email: templateInstance.find('input#portfolio_email').value, address: Session.get('selectedAccount') };
    // Description input parameters
    const PORTFOLIO_NAME = templateInstance.find('input#portfolio_name').value;
    const PORTFOLIO_SYMBOL = 'MLN-P';
    const PORTFOLIO_DECIMALS = 18;
    console.log(
      PORTFOLIO_NAME,
      PORTFOLIO_SYMBOL,
      PORTFOLIO_DECIMALS,
      addressList.universe,
      addressList.participation,
      addressList.riskMgmt,
      addressList.rewards,
    );
    const gasLimit = store.getState().web3.gasLimit;

    // Deploy
    const versionContract = Version.at(addressList.version);
    Session.set('NetworkStatus', {
      isInactive: false,
      isMining: true,
      isError: false,
      isMined: false,
    });
    versionContract
      .createVault(
      PORTFOLIO_NAME,
      PORTFOLIO_SYMBOL,
      PORTFOLIO_DECIMALS,
      addressList.universe,
      addressList.participation,
      addressList.riskMgmt,
      addressList.rewards,
      { from: Session.get('selectedAccount'), gas: gasLimit },
    )
      .then((result) => {
        let id;
        for (let i = 0; i < result.logs.length; i += 1) {
          if (result.logs[i].event === 'VaultAdded') {
            id = result.logs[i].args.id.toNumber();
            console.log('Vault has been created');
            console.log(`Vault id: ${id}`);
            Session.set('isNew', true);
            toastr.success(
              'Fund successfully created! You can now invest in your fund!',
            );
          }
        }
        Meteor.call('users.add', userInfo);
        return versionContract.getVault(id);
      })
      .then((info) => {
        const address = info[0];
        Session.set('NetworkStatus', {
          isInactive: false,
          isMining: false,
          isError: false,
          isMined: true,
        });
        FlowRouter.go(`/fund/${address}`);
      })
      .catch((err) => {
        console.log(err);
        toastr.error(
          'Oops, an error has occurred. Please verify your fund informations.',
        );
        Session.set('NetworkStatus', {
          isInactive: false,
          isMining: false,
          isError: false,
          isMined: true,
        });
        throw err;
      });
  },
});

Template.disclaimerModal.events({
  'click button#okDisclaimer': (event) => {
    Session.set('showModal', false);
  },
});
