import axios from 'axios';
import { ethers } from 'ethers';

import { displayTxData } from './display';

import type { BigNumber } from '@ethersproject/bignumber';
import type {
  ContractReceipt,
  ContractTransaction,
} from '@ethersproject/contracts';
import type {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider/lib/index';
import { Provider } from '@ethersproject/providers';

// would like to use "timers/promise" but this is not available for the web client
const setTimeoutPromise = <T>(delay: number, value: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
};

const sanitizeNetworkName = (networkName: string): string =>
  networkName.toLowerCase();

export const isLocalTestnet = (networkName: string) =>
  ['hardhat', 'local-testnet'].includes(sanitizeNetworkName(networkName));

const expectedBlockTimeInSeconds = (networkName: string): number => {
  switch (sanitizeNetworkName(networkName)) {
    case 'l14':
      return 5;
    case 'mumbai':
      return 2;
    case 'polygon':
      return 5;
    default:
      return 1;
  }
};

const getConfirmationConfigForNetwork = (networkName: string) => {
  // how many blocks we will wait for a tx to be considered confirmed
  const confirmationCount = isLocalTestnet(networkName) ? 1 : 2;

  // how much time we will wait for a tx to be considered confirmed
  const confirmationBlocks = isLocalTestnet(networkName) ? 1 : 200;
  const confirmationTimeoutInSeconds =
    confirmationBlocks * expectedBlockTimeInSeconds(networkName);

  return {
    confirmationCount,
    confirmationTimeoutInSeconds,
  };
};

export type WaitForTxOnNetworkResult = {
  sentTx: ContractTransaction;
  txReceipt: ContractReceipt;
};

export const waitForTxOnNetwork = async (
  networkName: string,
  txPromise: Promise<ContractTransaction>,
  logger = (..._data: Array<any>) => {},
): Promise<WaitForTxOnNetworkResult> => {
  const { confirmationCount, confirmationTimeoutInSeconds } =
    getConfirmationConfigForNetwork(networkName);

  const sentTx = await txPromise;
  logger(
    `sent tx ${displayTxData(
      sentTx.hash,
    )} and waiting for ${confirmationCount} confirmations`,
  );

  const maybeTxReceipt = await Promise.race([
    sentTx.wait(confirmationCount),
    setTimeoutPromise(
      confirmationTimeoutInSeconds * 1000,
      new Error(`tx timed out after ${confirmationTimeoutInSeconds} seconds`),
    ),
  ]);

  if (maybeTxReceipt instanceof Error) {
    throw maybeTxReceipt;
  }

  return { sentTx, txReceipt: maybeTxReceipt };
};

export const waitForFactoryDeployTxOnNetwork = async (
  networkName: string,
  deployTransaction: TransactionResponse,
  logger = (..._data: Array<any>) => {},
): Promise<{
  txReceipt: TransactionReceipt;
}> => {
  const { confirmationCount, confirmationTimeoutInSeconds } =
    getConfirmationConfigForNetwork(networkName);

  logger(
    `sent contract deploy tx ${displayTxData(
      deployTransaction.hash,
    )} and waiting for ${confirmationCount} confirmations`,
  );

  const maybeTxReceipt = await Promise.race([
    deployTransaction.wait(confirmationCount),
    setTimeoutPromise(
      confirmationTimeoutInSeconds * 1000,
      new Error(`tx timed out after ${confirmationTimeoutInSeconds} seconds`),
    ),
  ]);

  if (maybeTxReceipt instanceof Error) {
    throw maybeTxReceipt;
  }

  return { txReceipt: maybeTxReceipt };
};

export const getGasPrice = async (networkName: string): Promise<BigNumber> => {
  // NOTE: callers of this function should choose a max gas price as during network congestion the
  // fees can become extremely high
  switch (sanitizeNetworkName(networkName)) {
    case 'hardhat': {
      return ethers.utils.parseUnits('1', 'gwei');
    }
    case 'local-testnet': {
      return ethers.utils.parseUnits('1', 'gwei');
    }
    case 'polygon': {
      const gasPrices: {
        safeLow: number;
        standard: number;
        fast: number;
        fastest: number;
        blockTime: number;
        blockNumber: number;
      } = await axios
        .get('https://gasstation-mainnet.matic.network')
        .then((res) => res.data);
      return ethers.utils.parseUnits(String(gasPrices.fastest), 'gwei');
    }
    case 'mumbai': {
      const gasPrices: {
        safeLow: number;
        standard: number;
        fast: number;
        fastest: number;
        blockTime: number;
        blockNumber: number;
      } = await axios
        .get('https://gasstation-mumbai.matic.today')
        .then((res) => res.data);
      return ethers.utils.parseUnits(String(gasPrices.fastest), 'gwei');
      // const rpcGasPrice = await provider.getGasPrice();
      // return rpcGasPrice.mul(10);
    }
    default: {
      throw new Error(`cannot get gas price for network ${networkName}`);
    }
  }
};
