export const initialState = {
  isRegistered: false,
  isVerified: false,
};

export const types = {
  REGISTER: 'REGISTER:network:portal.melonport.com',
  UPDATE_ISREGISTERED: 'UPDATE_ISREGISTERED:network:portal.melonport.com',
  UPDATE_ISVERIFIED: 'UPDATE_ISVERIFIED:network:portal.melonport.com',
};

export const creators = {
  register: (email, address) => ({
    type: types.REGISTER,
    email,
    address,
  }),
  updateIsRegistered: isRegistered => ({
    type: types.UPDATE_ISREGISTERED,
    isRegistered,
  }),
  updateIsVerified: isVerified => ({
    type: types.UPDATE_ISVERIFIED,
    isVerified,
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
    case types.UPDATE_ISREGISTERED: {
      return {
        ...state,
        isRegistered: params.isRegistered,
      };
    }
    case types.UPDATE_ISVERIFIED: {
      return {
        ...state,
        isVerified: params.isVerified,
      };
    }
    default:
      return state;
  }
};

export default reducer;
