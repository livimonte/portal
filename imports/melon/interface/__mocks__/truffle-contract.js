import orderBook from '../__fixtures__/blockChainOrders';
import BigNumber from 'bignumber.js';

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
  balanceOf: jest.fn(
    ofAddress =>
      new Promise((resolve) => {
        resolve({ balanceOf: new BigNumber(10) });
      }),
  ),
  totalSupply: jest.fn(
    () =>
      new Promise((resolve) => {
        resolve(new BigNumber(1000));
      }),
  ),
  transfer: jest.fn(
    (toAddress, quantity, { from: fromAddress }) =>
      new Promise((resolve) => {
        resolve(new BigNumber(3));
      }),
  ),
  approve: jest.fn(
    (toAddress, quantity, { from: fromAddress }) =>
      new Promise((resolve) => {
        resolve(new BigNumber(4));
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
