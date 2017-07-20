import orderBook from '../__fixtures__/blockChainOrders';

const instance = {
  orders: jest.fn(
    id =>
      new Promise((resolve) => {
        resolve(orderBook.find(o => o.id === id).data);
      }),
  ),
  takeOrder: jest.fn(
    (exchange, id, quantity, objects) =>
      new Promise((resolve) => {
        resolve({ transactionHash: '0xBLUB' });
      }),
  ),
  getBalance: jest.fn(
    (tokenAddress, ofAddress) =>
      new Promise((resolve) => {
        resolve({ totalSupply: '1000000000', balanceOf: '50000000' });
      }),
  ),
};

const contract = {
  setProvider: jest.fn(),
  at: jest.fn(() => instance),
};

const constructor = jest.fn(() => contract);
constructor.mockInspect = { instance, contract };

export default constructor;
