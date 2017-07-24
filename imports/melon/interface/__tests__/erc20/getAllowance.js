import contract from 'truffle-contract';
import getAllowance from '../../erc20/getAllowance';
import BigNumber from 'bignumber.js';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('getAllowance', async () => {
  const result = await getAllowance('0xToken', '0x1', '0x2');

  expect(result).toBeTruthy();
  expect(result.owner === '0x1').toBeTruthy();
  expect(result.spender === '0x2').toBeTruthy();
  expect(result.approvedAmount.eq('6')).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract().at).toHaveBeenCalledWith('0xToken');
  expect(contract.mockInspect.instance.allowance).toHaveBeenCalledWith('0x1', '0x2');
});
