import contract from 'truffle-contract';
import getBalance from '../../erc20/getBalance';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('getBalance', async () => {
  const result = await getBalance('0xToken', '0x1');

  expect(result).toBeTruthy();
  expect(result.balanceOf.eq('10')).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract().at).toHaveBeenCalledWith('0xToken');
  expect(contract.mockInspect.instance.balanceOf).toHaveBeenCalledWith('0x1');
});
