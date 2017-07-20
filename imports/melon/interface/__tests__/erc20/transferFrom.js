import contract from 'truffle-contract';
import transferFrom from '../../erc20/transferFrom';
import BigNumber from 'bignumber.js';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('transferFrom', async () => {
  const result = await transferFrom('0xToken', '0x1', '0x2', new BigNumber(5));

  expect(result).toBeTruthy();
  expect(result.to === '0x2').toBeTruthy();
  expect(result.amountTransferred.eq(5)).toBeTruthy();
  expect(result.transfered.eq(5)).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract().at).toHaveBeenCalledWith('0xToken');
  expect(contract.mockInspect.instance.transferFrom).toHaveBeenCalledWith('0x1', '0x2', new BigNumber(5), { from: '0x2' });
});
