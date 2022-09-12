# Universal Profiles by FANZONE.io

Check out the live page at https://fanzone.cloud

Since day one we believe in Universal Profiles, created by Fabian Vogelsteller and brought forward by LUKSO and their vision.
Here a short video about it: https://youtu.be/S4A2cAYwdhA


URL structure: fanzone-media.github.io/up/#/:network


## WHAT CAN YOU DO WITH YOUR UP?
Your Universal Profile can act as your digital identity and digital reputation in Web3 and Metaverse.

We believe this is the most advanced and decentral identity standard (ERC725), created by Fabian Vogelsteller and brought forward through LUKSO and its vision.

Instead of plain old wallets, a Universal Profile can be customized like a social media profile - but is in your complete control. It’s easy to use and fun, so it’s ready for mass adoption.

- Collect, interact and showcase your digital assets, most important share your passion.
- Be safe and secure by giving different levels of permissions to decentral Apps, wallets and vaults.
- Personalize your own Universal Profile with profile and header picture, social media links and more.
- Buy, sell and auction your NFTs decentrally right from Universal Profiles, where they already are.
- Have true digital ownership of your profile, tokens (LSP7, LSP8, …) and over any other dApps.
- Universal Profiles sync seamlessly with mobile and regular web applications, like FANZONE.io




## Permission Management 

- connect with LUKSO extention or Metamask with address: `0x87847d301E8Da1D7E95263c3478d7F6e229E3F4b`
- choose the network in wallet where the universal profile is deployed
- visit: https://fanzone.cloud/#/addpermissions

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
