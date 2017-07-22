import UniverseJson from '@melonproject/protocol/build/contracts/Universe.json';
import ParticipationJson from '@melonproject/protocol/build/contracts/Participation.json';
import RiskMgmtV1Json from '@melonproject/protocol/build/contracts/RiskMgmtV1.json';
import RewardsJson from '@melonproject/protocol/build/contracts/Rewards.json';
import GovernanceJson from '@melonproject/protocol/build/contracts/Governance.json';
import VersionJson from '@melonproject/protocol/build/contracts/Version.json';

const KOVAN_NETWORK_ID = 42;

// Assets

// TODO Addresses are curr case sensitive!
exports.etherToken = '0x7506c7bfed179254265d443856ef9bda19221cd7';
exports.melonToken = '0x4dffea52b0b4b48c71385ae25de41ce6ad0dd5a7';
exports.bitcoinToken = '0x9e4c56a633dd64a2662bdfa69de4fde33ce01bdd';
exports.euroToken = '0xc151b622fded233111155ec273bfaf2882f13703';
exports.repToken = '0xf61b8003637e5d5dbb9ca8d799ab54e5082cbdbc';

// Price Feeds

exports.cryptoCompare = '0xAA959664FE49c5734748d80d11805c3909d9B147';

// Exchanges

exports.exchange = '0x47c158e0412a81a2dc330b6818522656519daafc';

// Universe

exports.universe = UniverseJson.networks[KOVAN_NETWORK_ID].address;

// Participation
exports.participation = ParticipationJson.networks[KOVAN_NETWORK_ID].address;

// Risk Mgmt

exports.riskMgmt = RiskMgmtV1Json.networks[KOVAN_NETWORK_ID].address;

// Fees

exports.rewards = RewardsJson.networks[KOVAN_NETWORK_ID].address;

// Governance

exports.governance = GovernanceJson.networks[KOVAN_NETWORK_ID].address;
exports.version = VersionJson.networks[KOVAN_NETWORK_ID].address;

// Liquidity Provider

exports.liquidityProvider = '0x00E0B33cDb3AF8B55CD8467d6d13BC0Ba8035acF';
