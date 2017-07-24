/* global web3 */
import contract from 'truffle-contract';
import EtherTokenJson from '@melonproject/protocol/build/contracts/EtherToken.json';

import addressList from '/imports/melon/interface/addressList';

/*
  @param quantity: BigNumber
*/
const depositAndApproveEther = async (
  fromAddress,
  toBeApprovedAddress,
  quantity,
) => {
  const EtherToken = contract(EtherTokenJson);
  EtherToken.setProvider(web3.currentProvider);
  const etherTokenContract = EtherToken.at(addressList.etherToken);
  await etherTokenContract.deposit({ from: fromAddress, value: quantity });
  await etherTokenContract.approve(
    toBeApprovedAddress, quantity, { from: fromAddress },
  );
};


export default depositAndApproveEther;
