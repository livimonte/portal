import contract from 'truffle-contract';
import web3 from '/imports/lib/web3/client';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

const performCalculations = async (vaultAddress, precision = 18) => {
  const Vault = contract(VaultJson);
  Vault.setProvider(web3.currentProvider);
  const vaultContract = Vault.at(vaultAddress);

  const calculations = await vaultContract.performCalculations();

  return {
    gav: calculations[0].div(Math.pow(10, precision)),
    managementReward: calculations[1].div(Math.pow(10, precision)),
    performanceReward: calculations[2].div(Math.pow(10, precision)),
    unclaimedRewards: calculations[3].div(Math.pow(10, precision)),
    nav: calculations[4].div(Math.pow(10, precision)),
    sharePrice: calculations[5].div(Math.pow(10, precision)),
  };
};

export default performCalculations;
