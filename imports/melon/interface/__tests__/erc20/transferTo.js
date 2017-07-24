import contract from 'truffle-contract';
import transferTo from '../../erc20/transferTo';
import BigNumber from 'bignumber.js';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('transferTo', async () => {
  const result = await transferTo('0xToken', '0x1', '0x2', new BigNumber(3));

  expect(result).toBeTruthy();
  expect(result.to === '0x2').toBeTruthy();
  expect(result.amountTransferred.eq(3)).toBeTruthy();
  expect(result.transfer.eq(3)).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract().at).toHaveBeenCalledWith('0xToken');
  expect(contract.mockInspect.instance.transfer).toHaveBeenCalledWith('0x2', new BigNumber(3), { from: '0x1' });
});
