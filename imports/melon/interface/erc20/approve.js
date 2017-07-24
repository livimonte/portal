import contract from 'truffle-contract';
import web3 from '/imports/lib/web3';
import ERC20Json from '@melonproject/protocol/build/contracts/ERC20.json';

/*
  @param quantity: BigNumber
*/

const approve = async (tokenAddress, fromAddress, toBeApprovedAddress, quantity) => {
  const Token = contract(ERC20Json);
  Token.setProvider(web3.currentProvider);
  const tokenContract = Token.at(tokenAddress);
  const approved = await tokenContract.approve(toBeApprovedAddress, quantity, { from: fromAddress });

  return approved ? {
    amountApproved: quantity,
    to: toBeApprovedAddress,
    approved,
  }
    : null;
};

export default approve;
