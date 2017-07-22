import addressList from '../addressList';
import constants from './constants.js';

// Tokens

export const getTokenPrecisionByAddress = (address) => {
  if (address === addressList.etherToken) return constants.ETHERTOKEN_PRECISION;
  if (address === addressList.melonToken) return constants.MELONTOKEN_PRECISION;
  if (address === addressList.bitcoinToken) {
    return constants.BITCOINTOKEN_PRECISION;
  }
  if (address === addressList.euroToken) return constants.EUROTOKEN_PRECISION;
  if (address === addressList.repToken) return constants.REPTOKEN_PRECISION;

  if (address === addressList.statusToken) return constants.STATUSTOKEN_PRECISION;
  if (address === addressList.aventcoinToken) return constants.AVENTCOINTOKEN_PRECISION;
  if (address === addressList.bancorToken) return constants.BANCORTOKEN_PRECISION;
  if (address === addressList.aragonToken) return constants.ARAGONTOKEN_PRECISION;
  if (address === addressList.basicAttentionToken) return constants.BASICATTENTIONTOKEN_PRECISION;
  if (address === addressList.dogecoinToken) return constants.DOGECOINTOKEN_PRECISION;
  if (address === addressList.digixDaoToken) return constants.DIGIXDAOTOKEN_PRECISION;
  if (address === addressList.litecoinToken) return constants.LITECOINTOKEN_PRECISION;
  if (address === addressList.digixGoldToken) return constants.DIGIXGOLDTOKEN_PRECISION;
  if (address === addressList.etherClassicToken) return constants.ETHERCLASSICTOKEN_PRECISION;
  if (address === addressList.makerDaoToken) return constants.MAKERDAOTOKEN_PRECISION;
  if (address === addressList.golemNetworkToken) return constants.GOLEMNETWORKTOKEN_PRECISION;
  if (address === addressList.rippleToken) return constants.RIPPLETOKEN_PRECISION;
  if (address === addressList.singularDtvToken) return constants.SINGULARDTVTOKEN_PRECISION;
  if (address === addressList.zeroXToken) return constants.ZEROXTOKEN_PRECISION;
  if (address === addressList.gnosisToken) return constants.GNOSISTOKEN_PRECISION;
  if (address === addressList.iconomiToken) return constants.ICONOMITOKEN_PRECISION;

  return false;
};

export const getTokenSymbolByAddress = (address) => {
  if (address === addressList.etherToken) return 'ETH-T';
  if (address === addressList.melonToken) return 'MLN-T';
  if (address === addressList.bitcoinToken) return 'BTC-T';
  if (address === addressList.euroToken) return 'EUR-T';
  if (address === addressList.repToken) return 'REP-T';

  if (address === addressList.statusToken) return 'SNT-T';
  if (address === addressList.aventcoinToken) return 'AVT-T';
  if (address === addressList.bancorToken) return 'BNT-T';
  if (address === addressList.aragonToken) return 'ANT-T';
  if (address === addressList.basicAttentionToken) return 'BAT-T';
  if (address === addressList.dogecoinToken) return 'DOGE-T';
  if (address === addressList.digixDaoToken) return 'DGD-T';
  if (address === addressList.litecoinToken) return 'LTC-T';
  if (address === addressList.digixGoldToken) return 'DGX-T';
  if (address === addressList.etherClassicToken) return 'ETC-T';
  if (address === addressList.makerDaoToken) return 'MKR-T';
  if (address === addressList.golemNetworkToken) return 'GNT-T';
  if (address === addressList.rippleToken) return 'XRP-T';
  if (address === addressList.singularDtvToken) return 'SNGLS-T';
  if (address === addressList.zeroXToken) return 'ZRX-T';
  if (address === addressList.gnosisToken) return 'GNO-T';
  if (address === addressList.iconomiToken) return 'ICN-T';
  return false;
};

export const getTokenNameBySymbol = (symbol) => {
  if (symbol === 'ETH-T') return 'Ether Token';
  if (symbol === 'MLN-T') return 'Melon Token';
  if (symbol === 'BTC-T') return 'Bitcoin Token';
  if (symbol === 'EUR-T') return 'Euro Token';
  if (symbol === 'REP-T') return 'Rep Token';

  if (symbol === 'SNT-T') return 'Status Network Token';
  if (symbol === 'AVT-T') return 'AventCoin';
  if (symbol === 'BNT-T') return 'Bancor Network Token';
  if (symbol === 'ANT-T') return 'Aragon Network Token';
  if (symbol === 'BAT-T') return 'Basic Attention Token';
  if (symbol === 'DOGE-T') return 'Dogecoin Token';
  if (symbol === 'DGD-T') return 'Digix Dao Token';
  if (symbol === 'LTC-T') return 'Litecoin Token';
  if (symbol === 'DGX-T') return 'Digix Gold Token';
  if (symbol === 'ETC-T') return 'Ether Classic Token';
  if (symbol === 'MKR-T') return 'MakerDAO Token';
  if (symbol === 'GNT-T') return 'Golem Network Token';
  if (symbol === 'XRP-T') return 'Ripple Token';
  if (symbol === 'SNGLS-T') return 'SingularDTV Token';
  if (symbol === 'ZRX-T') return '0x Protocol Token';
  if (symbol === 'GNO-T') return 'Gnosis Token';
  if (symbol === 'ICN-T') return 'Iconomi Token';

  return false;
};

export const getTokenAddress = (symbol) => {
  if (symbol === 'ETH-T') return addressList.etherToken;
  if (symbol === 'MLN-T') return addressList.melonToken;
  if (symbol === 'BTC-T') return addressList.bitcoinToken;
  if (symbol === 'EUR-T') return addressList.euroToken;
  if (symbol === 'REP-T') return addressList.repToken;

  if (symbol === 'SNT-T') return addressList.statusToken;
  if (symbol === 'AVT-T') return addressList.aventcoinToken;
  if (symbol === 'BNT-T') return addressList.bancorToken;
  if (symbol === 'ANT-T') return addressList.aragonToken;
  if (symbol === 'BAT-T') return addressList.basicAttentionToken;
  if (symbol === 'DOGE-T') return addressList.dogecoinToken;
  if (symbol === 'DGD-T') return addressList.digixDaoToken;
  if (symbol === 'LTC-T') return addressList.litecoinToken;
  if (symbol === 'DGX-T') return addressList.digixGoldToken;
  if (symbol === 'ETC-T') return addressList.etherClassicToken;
  if (symbol === 'MKR-T') return addressList.makerDaoToken;
  if (symbol === 'GNT-T') return addressList.golemNetworkToken;
  if (symbol === 'XRP-T') return addressList.rippleToken;
  if (symbol === 'SNGLS-T') return addressList.singularDtvToken;
  if (symbol === 'ZRX-T') return addressList.zeroXToken;
  if (symbol === 'GNO-T') return addressList.gnosisToken;
  if (symbol === 'ICN-T') return addressList.iconomiToken;

  return false;
};

export const getTokenPrecisionBySymbol = (symbol) => {
  if (symbol === 'ETH-T') return constants.ETHERTOKEN_PRECISION;
  if (symbol === 'MLN-T') return constants.MELONTOKEN_PRECISION;
  if (symbol === 'BTC-T') return constants.BITCOINTOKEN_PRECISION;
  if (symbol === 'EUR-T') return constants.EUROTOKEN_PRECISION;
  if (symbol === 'REP-T') return constants.REPTOKEN_PRECISION;
  return false;
};

export const networkMapping = {
  4: 'Rinkeby',
  3: 'Ropsten',
  42: 'Kovan',
  1: 'Main',
  null: 'Private',
};

export const getQuoteTokens = () => ['ETH-T'];

export const getBaseTokens = () => ['MLN-T', 'BTC-T', 'EUR-T', 'REP-T', 'ANT-T', 'AVT-T', 'BNT-T', 'BAT-T', 'DGD-T', 'DGX-T', 'DOGE-T', 'ETC-T', 'GNO-T', 'GNT-T', 'ICN-T', 'LTC-T', 'MKR-T', 'XRP-T', 'SNGLS-T', 'SNT-T', 'ZRX-T'];

export const getTokens = () => ['ETH-T', 'MLN-T', 'BTC-T', 'EUR-T', 'REP-T', 'ANT-T', 'AVT-T', 'BNT-T', 'BAT-T', 'DGD-T', 'DGX-T', 'DOGE-T', 'ETC-T', 'GNO-T', 'GNT-T', 'ICN-T', 'LTC-T', 'MKR-T', 'XRP-T', 'SNGLS-T', 'SNT-T', 'ZRX-T'];
