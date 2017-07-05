export const initialState = {
  isRegistered: false,
  isVerified: false,
};

export const types = {
  REGISTER: 'REGISTER:network:portal.melonport.com',
  UPDATE_VERIFICATION: 'UPDATE_VERIFICATION:network:portal.melonport.com',
};

export const creators = {
  register: (email, address) => ({
    type: types.REGISTER,
    email,
    address,
  }),
  updateVerification: (isRegistered, isVerified) => ({
    type: types.UPDATE_VERIFICATION,
    isRegistered,
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
    case types.UPDATE_VERIFICATION: {
      return {
        ...state,
        isRegistered: params.isRegistered,
        isVerified: params.isVerified,
      };
    }
    default:
      return state;
  }
};

export default reducer;
