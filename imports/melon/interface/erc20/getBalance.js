import contract from 'truffle-contract';
import web3 from '/imports/lib/web3';
import ERC20Json from '@melonproject/protocol/build/contracts/ERC20.json';

const getBalance = async (tokenAddress, ofAddress) => {
  const Token = contract(ERC20Json);
  Token.setProvider(web3.currentProvider);
  const tokenContract = Token.at(tokenAddress);
  const balance = await tokenContract.balanceOf(ofAddress);

  return balance;
};

export default getBalance;
