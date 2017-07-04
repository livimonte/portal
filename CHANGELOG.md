# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

=========
### HEADS UP: New settings! Please update the /settings folder!
=========

## [Unreleased]
### Added
- Error logging with [sentry](https://sentry.io/melonport/).
- This changelog #243
### Fixed
- Performance issues #278: Watch the blockchain instead of polling. Do not run `web3.isConnected()` but check if block numbers on sync/web-server and client are similar (+/- 1)

## [0.1.0] - 2017-06-13
This release contains the following **highlights**:
-  Create a fund (in ERC20 format) and invest upon creation. For this version, you can only invest in your fund once.
- Trade using the first Melon Universe Module which is now live with 5 ERC20 assets (ETH, BTC, MLN, EUR and REP). Trades history is visible on kovan.etherscan.io.
- Monitor prices of these assets using the first data feed module brought to you by Cryptocompare and Oraclize using **native proofs**
- Calculate fund/share prices as well as NAV in real time (assuming for this version zero management and performance fees)
- Redeem and annihilate shares in your fund at any time (using redeem)
- Trade on our exchange against our liquidity provider, which tracks real prices and provides continuous bids and asks (liquidity) at current market prices
- Generate a **real track record** on Kovan secured by the integrity of Kovan authorities

More information can be found in our [blog post](https://medium.com/@melonproject/melon-v0-1-0-release-2a81102b03fd)

## [0.0.3] - 2017-02-20
In preparation for upgrades on the protocol smart contracts, where unfortunately portfolio data will be lost, one can now withdraw invested testnet ether from the portfolios. 

1. On `portfolio` page; In portfolios with non-zero `Personal Stake`, select `Redeem` in the `Manage Participation` card and redeem all your invested amount
1. On `wallet` page; For accounts with non-zero `Ether Token` balance, select `Convert ETH Token to ETH` in the `Wallet Holdings` card.
1. Wait for transaction to process and enjoy your testnet ether :)
