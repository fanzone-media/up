// import config before anything else
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

// types
import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";

import "./tasks";

const envConfig = {
  testnetMnemonic: process.env.HARDHAT_TESTNET_MNEMONIC,
  reportGas: process.env.HARDHAT_REPORT_GAS === "true",
};

const testnetAccountConfig = {
  mnemonic: envConfig.testnetMnemonic,
  count: 20,
};

const hardhatNetworkConfig = {
  // this is the default value for 'hardhat' network
  // defining here to access it from `hre.config.network.chainId` when using `local-testnet` param
  chainId: 31337,
  blockGasLimit: 50e6, // 50.000.000
  gasPrice: 1e9, // 1 gwei
  accounts: testnetAccountConfig,
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  },
  networks: {
    // NOTE: we use same config for 'local-testnet' and 'hardhat' because we can only use
    // `npx hardhat node --network hardhat` to start local node, and need another network name to
    // run tasks / testsuite (using `--network hardhat` will start an in-process node)
    ["local-testnet"]: {
      ...hardhatNetworkConfig,
      url: "http://127.0.0.1:8545",
    },
    hardhat: hardhatNetworkConfig,
    l14: {
      chainId: 22,
      blockGasLimit: 50e6, // 50.000.000
      url: "https://rpc.l14.lukso.network",
      accounts: testnetAccountConfig,
    },
    mumbai: {
      chainId: 80001,
      blockGasLimit: 20453249,
      gasPrice: 10e9,
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: testnetAccountConfig,
    },
    coverage: {
      // Coverage launches its own ganache-cli client
      url: "http://127.0.0.1:8555",
    },
  },
  etherscan: {
    apiKey: {
      // polygonscan
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: envConfig.reportGas,
    showMethodSig: true,
  },
};

export default config;
