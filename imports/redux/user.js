export const initialState = {
  isRegistered: false,
  aumSort: -1,
  sharePriceSort: -1,
  prioritySorting: 'sharePriceSort',
};

export const types = {
  REGISTER: 'REGISTER:network:portal.melonport.com',
  SORT_AUM: 'SORT_AUM:network:portal.melonport.com',
  SORT_SHAREPRICE: 'SORT_SHAREPRICE:network:portal.melonport.com',
};

export const creators = {
  register: (userData, captchaData) => ({
    type: types.REGISTER,
    userData,
    captchaData,
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
    case types.SORT_AUM: {
      return {
        ...state,
        aumSort: params.sortType,
        prioritySorting: 'aumSort',
      };
    }
    case types.SORT_SHAREPRICE: {
      return {
        ...state,
        sharePriceSort: params.sortType,
        prioritySorting: 'sharePriceSort',
      };
    }
    default:
      return state;
  }
};

export default reducer;
