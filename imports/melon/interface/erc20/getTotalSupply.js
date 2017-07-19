import contract from 'truffle-contract';
import web3 from '/imports/lib/web3';
import ERC20Json from '@melonproject/protocol/build/contracts/ERC20.json';

/*
  @post: returns totalSupply of the token as Big Number
*/

const getTotalSupply = async (tokenAddress) => {
  const Token = contract(ERC20Json);
  Token.setProvider(web3.currentProvider);
  const tokenContract = Token.at(tokenAddress);
  const totalSupply = await tokenContract.totalSupply();

  return totalSupply ? {
    tokenAddress,
    totalSupply,
  }
    : null;
};

export default getTotalSupply;
