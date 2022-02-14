Checkout the site: https://fanzone-media.github.io/up/#/${network}

For development:

- npm run start

For deployment to gh-pages

- npm run deploy

## Setup

### Install dependencies & submodules

- `npm install`
- `git submodule update --init --recursive`

Then perform a install and build of the smart contracts

- `npm run build-fanzone-contracts`

### Pulling in updates from submodules

We are using git submodule to sync `fanzone-smart-contracts` repo. Since this is the source code, its also needed to build the contracts.

A package.json script is available to perform submodule sync, npm install and build of the smart contract repo

- `npm run build-fanzone-contracts`
