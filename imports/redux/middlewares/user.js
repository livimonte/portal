import { Meteor } from 'meteor/meteor';
import { types as userTypes } from '/imports/redux/user';
import { types as web3Types } from '/imports/redux/web3';
import { creators } from '/imports/redux/user';
import Users from '/imports/api/users';

const userMiddleware = store => next => (action) => {
  const { type, ...params } = action;
  const currentState = store.getState();

  switch (type) {
    case userTypes.REGISTER: {
      const email = params.email;
      const address = params.address;
      Meteor.call('users.add', {
        email,
        address,
      });
      break;
    }
    case web3Types.UPDATE: {
      const currentAccount = currentState.web3.account;
      const updatedAccount = action.account;
      if (currentAccount !== updatedAccount) {
        const user = Users.findOne({ address: updatedAccount });
        if (user) {
          store.dispatch(creators.updateIsRegistered(true));
          if (user.verified) {
            store.dispatch(creators.updateIsVerified(true));
          }
        } else {
          store.dispatch(creators.updateIsRegistered(false));
          store.dispatch(creators.updateIsVerified(false));
        }
      }
      break;
    }
    default:
  }
  return next(action);
};

export default userMiddleware;
