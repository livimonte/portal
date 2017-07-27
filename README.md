<img src = "https://github.com/melonproject/branding/blob/master/facebook/Facebook%20cover%20blue%20on%20white.png" width = "100%">

# portal

Application of the melon protocol portal. 

[![Gitter][gitter-badge]][gitter-url]
[![License: GPL v3][license-badge]][license-badge-url]
[![Dependencies][dependencies-badge]][dependencies-badge-url]
[![Dev Dependencies][devDependencies-badge]][devDependencies-badge-url]
[![NSP Status][NSP Status badge]][NSP Status]
[![Crash Reports: Sentry][Sentry Badge]][Sentry]


## Installation

1. Clone this repository
    ```
    git clone git@github.com:melonproject/portal.git
    cd portal

    ```

2. Install dependencies:
    ```
    meteor npm install
    ```

## Getting started

After installation is complete

Go to the above `portal` directory, open a terminal and launch meteor:

```
npm start
```

## [chimp testing](https://chimp.readme.io/)

To run the chimp tests, you need to have a Meteor & 
[testrpc](https://github.com/ethereumjs/testrpc) instances running. To do this,
open 3 terminal windows and run the following commands in each window:

- ```npm start```
- ```npm run testrpc```
- ```npm run test:chimp:watch``` to only run tests annotated with '@watch' or
    ```npm run test:chimp:once``` to run all chimp tests (can take some time)
    just once.

If you have your own Ethereum client running locally on http://localhost:8545, 
I strongly suggest that you pause it as long as the tests run.


## Unit Testing

We use [Facebook's Jest](https://facebook.github.io/jest/) for Unit Testing. Run all Jest-Tests with:

    npm run jest

(You do not have to install Jest globally on your machine).

During development, I recommend watching the changed files in the background
and test them when changed automatically with

    npm run jest:watch

### Troubleshooting

If you have troubles running the watch command with the following error:

    Error: Error watching file for changes: EMFILE

Try install [Watchman](https://facebook.github.io/watchman/docs/install.html) with:

    brew install watchman

(Thanks to [Colin Witkamp](https://stackoverflow.com/questions/41657754/testing-with-jest-failed-with-error-error-watching-file-for-changes-emfile) / [robzolkos](https://github.com/facebook/jest/issues/1767#issuecomment-248883102))


## Deploy

Deployment is on [Meteors Galaxy](https://www.meteor.com/hosting). There are two types of possible deployments:

1. Full deployments (as in dev mode / stage / one sync service for live): Server syncs with blockchain. Vertical scale.
2. Webfront: Server does not sync with the blockchain. Horizontal scale.

The idea is to have only one full instance (ie. container) running which scales vertically (more CPU/RAM)
and multiple webfront instances to scale horizontally.

Deploy the live system with:
    
    npm run deploy:sync
    npm run deploy:webfront

Deploy the stage system with:

    npm run deploy:stage

Everyone is free to host & run this portal elsewhere. All the important data is
synced from the blockchain.



[gitter-badge]: https://img.shields.io/gitter/room/melonproject/general.js.svg?style=flat-square
[gitter-url]: https://gitter.im/melonproject/general?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge[license-badge]: https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square
[license-badge-url]: ./LICENSE
[dependencies-badge]: https://img.shields.io/david/melonproject/portal.svg?style=flat-square
[dependencies-badge-url]: https://david-dm.org/melonproject/portal
[devDependencies-badge]: https://img.shields.io/david/dev/melonproject/portal.svg?style=flat-square
[devDependencies-badge-url]: https://david-dm.org/melonproject/portal#info=devDependencies
[NSP Status badge]: https://nodesecurity.io/orgs/melonproject/projects/cb1dd04e-1069-4ffd-8210-70ec757ed3de/badge
[NSP Status]: https://nodesecurity.io/orgs/melonproject/projects/cb1dd04e-1069-4ffd-8210-70ec757ed3de
[Sentry Badge]: https://img.shields.io/badge/crash%20reports-sentry-%2396B0C2.svg?style=flat-square
[Sentry]: https://sentry.io/melonproject/
