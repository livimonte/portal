import UniverseJson from '@melonproject/protocol/build/contracts/Universe.json';
import ParticipationJson from '@melonproject/protocol/build/contracts/Participation.json';
import RiskMgmtV1Json from '@melonproject/protocol/build/contracts/RiskMgmtV1.json';
import RewardsJson from '@melonproject/protocol/build/contracts/Rewards.json';
import GovernanceJson from '@melonproject/protocol/build/contracts/Governance.json';
import VersionJson from '@melonproject/protocol/build/contracts/Version.json';

const KOVAN_NETWORK_ID = 42;

// Assets

// TODO Addresses are curr case sensitive!
exports.etherToken = '0x1a825e9bf3bdc8ef8b975f97c78b5208a947d0ec';
exports.melonToken = '0x2a20ff70596e431ab26c2365acab1b988da8eccf';
exports.bitcoinToken = '0xf53e3b6c12f8c66324a64f31277260c06d869732';
exports.euroToken = '0xcaac95ab4d30ee8d6162e55eb3430134fec5af50';
exports.repToken = '0x64af87a36a407732320c4dc1852debc60cd81c5e';
exports.statusToken = '0x64c4406c58c512f326d83065a72f12884105520b';
exports.aventcoinToken = '0x20a0e0dece9fb6c690cdb439db2b385d271bda3f';
exports.bancorToken = '0x764ae227ad6a6e143546772169265d76aa9337c6';
exports.aragonToken = '0xd99aed09a65ee8377a2ffad8ed5407785c530869';
exports.basicAttentionToken = '0xfee1d0dc0b5b6f2f20d8e9f7e95e9e367e4a61a7';
exports.dogecoinToken = '0xc37cdfb70bd68f6fcf2ab0a97e1d6a12eaa9215f';
exports.digixDaoToken = '0x3b7c7c457d3aae04a4631e4888aeeedd08b24e41';
exports.litecoinToken = '0xf051264ab9046fd73cbd00df5e732d2ca78ee704';
exports.digixGoldToken = '0x804b7f797eee4d51fef29b3ef7e525a3848a0c0f';
exports.etherClassicToken = '0x334559e91238f466c95bb8241555f6ad27f5978b';
exports.makerDaoToken = '0xe1b25bcae898ab228a13eac49ebba8d3df9add70';
exports.golemNetworkToken = '0x08c24283f0b6c07ff9793a1b8534a49b32c07e73';
exports.rippleToken = '0x3b43249de8eee169eea7226a48699fcba8df3686';
exports.singularDtvToken = '0x4c4e2b285e446fb1974dcc3a665caba7c189a96f';
exports.zeroXToken = '0xbb0449e9b66e2e1438522645cae6cf9cd8595793';
exports.gnosisToken = '0xc73d78870ba5a3eaddc2be371af09b2c429cb2ca';
exports.iconomiToken = '0xc87bad39aadb70257e2417bd8f4983361599394d';

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
exports.liquidityProvider = '0x00360d2b7D240Ec0643B6D819ba81A09e40E5bCd'.toLowerCase();
