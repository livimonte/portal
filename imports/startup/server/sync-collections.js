// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Meteor } from 'meteor/meteor';
// Collections
import Assets from '/imports/api/assets';
import Vaults from '/imports/api/vaults';
import Orders from '/imports/api/orders';
import Trades from '/imports/api/trades';
import serverStates from '/imports/api/serverStates';

// EXECUTION
Meteor.startup(() => {
  if (!Meteor.settings.public.disableSync) {
    Assets.remove({});

    Vaults.remove({});
    Vaults.sync();
    Vaults.watch();

    Orders.remove({});
    Orders.sync();
    Orders.watch();

    Trades.remove({});
    Trades.watch();

    serverStates.watch();
  }
});
