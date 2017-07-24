import contract from 'truffle-contract';
import getTotalSupply from '../../erc20/getTotalSupply';
import BigNumber from 'bignumber.js';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('getTotalSupply', async () => {
  const result = await getTotalSupply('0x');

  expect(result).toBeTruthy();
  expect(result.tokenAddress === '0x').toBeTruthy();
  expect(result.totalSupply.eq('1000')).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract().at).toHaveBeenCalledWith('0x');
  expect(contract.mockInspect.instance.totalSupply).toHaveBeenCalledWith();
});
