import contract from 'truffle-contract';
import web3 from '/imports/lib/web3';
import ERC20Json from '@melonproject/protocol/build/contracts/ERC20.json';

/*
  @param quantity: BigNumber
*/

const transferTo = async (tokenAddress, fromAddress, toAddress, quantity) => {
  const Token = contract(ERC20Json);
  Token.setProvider(web3.currentProvider);
  const tokenContract = Token.at(tokenAddress);
  const transfer = await tokenContract.transfer(toAddress, quantity, { from: fromAddress });

  return transfer ? {
    amountTransferred: quantity,
    to: toAddress,
    transfer,
  }
    : null;
};

export default transferTo;
