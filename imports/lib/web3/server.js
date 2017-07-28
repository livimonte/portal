import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

export default Meteor.isServer ? new Web3(new Web3.providers.HttpProvider(Meteor.settings.private.JSON_RPC_URL)) : null;
