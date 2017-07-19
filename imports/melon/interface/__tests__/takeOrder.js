import contract from 'truffle-contract';
import BigNumber from 'bignumber.js';

import addressList from '../addressList';
import takeOrder from '../takeOrder';
import convertFromTokenPrecision from '../helpers/convertFromTokenPrecision';

jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });

test('without quantity (-> max) & basic calling testing', async () => {
  const result = await takeOrder(6870, '0xMANAGER', '0xVAULT');

  expect(result).toBeTruthy();
  expect(result.executedQuantity.eq('8.55505176')).toBeTruthy();
  expect(contract).toHaveBeenCalled();
  expect(contract.mockInspect.contract.setProvider).toHaveBeenCalled();
  expect(contract.mockInspect.contract.at).toHaveBeenCalled();
  expect(contract.mockInspect.instance.orders).toHaveBeenCalledWith(6870);
  expect(
    contract.mockInspect.instance.takeOrder,
  ).toHaveBeenCalledWith(
    addressList.exchange,
    6870,
    new BigNumber('8555051760000000000'),
    {
      from: '0xMANAGER',
    },
  );
});

test('with higher quantity -> take max', async () => {
  const result = await takeOrder(
    6870,
    '0xMANAGER',
    '0xVAULT',
    new BigNumber('9.55505176'),
  );

  expect(result).toBeTruthy();
  expect(result.executedQuantity.eq('8.55505176')).toBeTruthy();
  expect(
    contract.mockInspect.instance.takeOrder,
  ).toHaveBeenCalledWith(
    addressList.exchange,
    6870,
    new BigNumber('8555051760000000000'),
    {
      from: '0xMANAGER',
    },
  );
});

test('with lower quantity -> take as specified', async () => {
  const result = await takeOrder(
    6870,
    '0xMANAGER',
    '0xVAULT',
    new BigNumber('1'),
  );

  expect(result).toBeTruthy();
  expect(result.executedQuantity.eq('1')).toBeTruthy();
  expect(
    contract.mockInspect.instance.takeOrder,
  ).toHaveBeenCalledWith(
    addressList.exchange,
    6870,
    new BigNumber('1000000000000000000'),
    {
      from: '0xMANAGER',
    },
  );
});
