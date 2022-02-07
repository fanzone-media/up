# fanzone-smart-contractss

## Setup

### Run first time compile

We are using `typechain` and will see the test suite fail if it has not compiled & generated assets in the `typechain/` dir.

- `npm run build`

**NOTE:** if `npx hardhat clean` is used, and then `npm run test` the test suite will fail since we import things from `typechain/` dir.. can always run `npm run test` twice, but its good to know there isn't something weird going on (just a missing directory when the hardhat process begins).

### Fill in details in `.env`

- `cp .env.example .env`
- fill in `HARDHAT_TESTNET_MNEMONIC`
- fill in `PROFILE_ADDRESS_*` (can be the same address if you want to deploy only one UniversalProfile & only required for non-local testnet)

### Run on local-testnet

- in a terminal window run `npx hardhat node`
- in another terminal window run `npx hardhat fnz:setup-named-accounts-in-hdwallet --network local-testnet`
- save the output UniversalProfile and KeyManager addresses into your `.env`

For future runs, these UniversalProfile and KeyManager addresses should stay the same and now you can use the quick setup task:

- kill the `npx hardhat node` task, and restart
- can run the `npx hardhat fnz:setup-baseline-ecosystem --network local-testnet`

- fnz:setup-baseline-ecosystem

## Development

We are using [hardhat](https://hardhat.org/) for testing & tasks.

**NOTE:** pass the flag `--network NETWORK_NAME` when you want to run tests/tasks on a an exposed network. otherwise a special network "hardhat" is used, which starts and stops with the process.

- `npx hardhat get-account-balances --network l14`
- `npm run test --network l14`

### Developing with a local testnet

Hardhat comes with a task for running a local node. The file `hardhat.config.ts` has a network named "local-testnet" to access this network from tasks. Can use the url in other clients when developing locally (ie. web clients) to see the result of tasks.

- in one terminal window run `npx hardhat node`
- in another terminal window use flag `--network local-testnet` when running tasks

### Running tests

`npm run test`

### Using Tasks

To see all available tasks run `npx hardhat help`.
