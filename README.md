# Universal Profiles by FANZONE.io

Check out the live page at https://fanzone.cloud

Since day one we believe in Universal Profiles, created by Fabian Vogelsteller and brought forward by LUKSO and their vision.


URL structure: fanzone-media.github.io/up/#/:network


## Add permissions

- connect with LUKSO extention or Metamask with address: `0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b`
- choose the network in wallet where the universal profile is deployed
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
