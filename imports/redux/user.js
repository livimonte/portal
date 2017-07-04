import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';

export const initialState = {
  isRegistered: false,
};

export const types = {
  REGISTER: 'REGISTER:network:portal.melonport.com',
};

export const creators = {
  register: (email, address) => ({
    type: types.REGISTER,
    email,
    address,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.REGISTER: {
      return {
        ...state,
        isRegistered: true,
      };
    }
    default:
      return state;
  }
};

export const middleware = store => next => (action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.REGISTER: {
      const email = params.email;
      const address = params.address;
      Meteor.call('users.add', {
        email,
        address,
      });
      break;
    }
    default:
  }
  return next(action);
};

export default reducer;
