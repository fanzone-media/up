Checkout the site: https://fanzone-media.github.io/up/#/mumbai

URL structure: fanzone-media.github.io/up/#/:network

Available networks for `:network` param are:

1. polygon
2. mumbai
3. l14
4. ethereum

## Add permissions

- connect Metamask with address: `0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b`
- choose the network in metamask where the universal profile is deployed
- visit: https://fanzone-media.github.io/up/#/addpermissions

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
