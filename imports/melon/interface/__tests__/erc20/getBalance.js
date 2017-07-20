import contract from 'truffle-contract';
import BigNumber from 'bignumber.js';

import getBalance from '../../erc20/getBalance';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('getBalance', async () => {
  const result = await getBalance('0x', '0x');

  expect(result).toBeTruthy();
  expect(result.balanceOf.eq('10')).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract.mockInspect.instance.balanceOf).toHaveBeenCalledWith('0x');
});
