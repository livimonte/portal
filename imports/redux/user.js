export const initialState = {
  isRegistered: false,
  isVerified: false,
  aumSort: -1,
  sharePriceSort: -1,
};

export const types = {
  REGISTER: 'REGISTER:network:portal.melonport.com',
  UPDATE_VERIFICATION: 'UPDATE_VERIFICATION:network:portal.melonport.com',
  SORT_AUM: 'SORT_AUM:network:portal.melonport.com',
  SORT_SHAREPRICE: 'SORT_SHAREPRICE:network:portal.melonport.com',
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
  sortAUM: sortType => ({
    type: types.SORT_AUM,
    sortType,
  }),
  sortSharePrice: sortType => ({
    type: types.SORT_SHAREPRICE,
    sortType,
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
    case types.SORT_AUM: {
      return {
        ...state,
        aumSort: params.sortType,
      };
    }
    case types.SORT_SHAREPRICE: {
      return {
        ...state,
        sharePriceSort: params.sortType,
      };
    }
    default:
      return state;
  }
};

export default reducer;
