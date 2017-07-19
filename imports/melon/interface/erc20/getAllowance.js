import contract from 'truffle-contract';
import web3 from '/imports/lib/web3';
import ERC20Json from '@melonproject/protocol/build/contracts/ERC20.json';

/*
  @param: ownerAddress is the address who owns the funds; spenderAddress is the address who is approved to spend it
  @post: returns the amount which spender is still allowed to withdraw from owner (as Big Number)
*/

const getAllowance = async (tokenAddress, ownerAddress, spenderAddress) => {
  const Token = contract(ERC20Json);
  Token.setProvider(web3.currentProvider);
  const tokenContract = Token.at(tokenAddress);
  const approvedAmount = await tokenContract.allowance(ownerAddress, spenderAddress);

  return approvedAmount ? {
    approvedAmount,
    owner: ownerAddress,
    spender: spenderAddress,
  }
    : null;
};

export default getAllowance;
