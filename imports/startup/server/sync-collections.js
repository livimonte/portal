import { Meteor } from 'meteor/meteor';
// Collections
import Assets from '/imports/api/assets';
import Vaults from '/imports/api/vaults';
import Orders from '/imports/api/orders';
import Trades from '/imports/api/trades';
import Users from '/imports/api/users';
import serverStates from '/imports/api/serverStates';

// EXECUTION
Meteor.startup(() => {
  serverStates.watch();

  reCAPTCHA.config({
    privatekey: '6Lf0gygUAAAAAGnUg8xkjRAdWKtA80ccwoB2cOYh',
  });

  if (!Meteor.settings.public.DISABLE_SYNC) {
    Assets.remove({});

    Vaults.remove({});
    Vaults.sync();
    Vaults.watch();

    Orders.remove({});
    Orders.sync();
    Orders.watch();

    Trades.remove({});
    Trades.watch();
  }
});
Meteor.onConnection((connection) => {
  const clientIp = connection.clientAddress;
  console.log('-----------CLIENT IP -------------- ', clientIp);
});
