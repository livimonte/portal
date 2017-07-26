import BigNumber from 'bignumber.js';

import orders from '../__fixtures__/orderBook';

import matchOrders from '../matchOrders';

test('matchOrders without same price orders', () => {
  const sellMelonOrders = orders.filter(o => o.sell.symbol === 'MLN-T');
  const matchedOrders = matchOrders('sell', new BigNumber(0.4), sellMelonOrders);
  expect(matchedOrders.length).toBe(2);
  expect(matchedOrders.map(o => o.id)).toEqual([2, 1]);
});

test('matchOrders with same price orders', () => {
  const sellMelonOrders = orders.filter(o => o.sell.symbol === 'MLN-T');
  const matchedOrders = matchOrders('sell', new BigNumber(0.5), sellMelonOrders);
  expect(matchedOrders.length).toBe(4);
  expect(matchedOrders.map(o => o.id)).toEqual([3, 4, 2, 1]);
});

test('matchOrders w a buy order w same price orders', () => {
  const buyRepOrders = orders.filter(o => o.buy.symbol === 'REP-T');
  const matchedOrders = matchOrders('buy', new BigNumber(0.125), buyRepOrders);
  expect(matchedOrders.length).toBe(3);
  expect(matchedOrders.map(o => o.id)).toEqual([51, 6870, 6867]);
});
