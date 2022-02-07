import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/abstract-provider/lib/index";
import { displayTxData } from "./display";

// would like to use "timers/promise" but this is not available for the web client
const setTimeoutPromise = <T>(delay: number, value: T): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
};

export const isLocalTestnet = (networkName: string) =>
  ["hardhat", "local-testnet"].includes(networkName);

const expectedBlockTimeInSeconds = (networkName: string): number => {
  switch (networkName) {
    case "l14":
      return 5;
    case "mumbai":
      return 2;
    case "polygon":
      return 2;
    default:
      return 1;
  }
};

const getConfirmationConfigForNetwork = (networkName: string) => {
  // how many blocks we will wait for a tx to be considered confirmed
  const confirmationCount = isLocalTestnet(networkName) ? 1 : 2;

  // how much time we will wait for a tx to be considered confirmed
  const confirmationBlocks = isLocalTestnet(networkName) ? 1 : 8;
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
  logger = (..._data: Array<any>) => {}
): Promise<WaitForTxOnNetworkResult> => {
  const { confirmationCount, confirmationTimeoutInSeconds } =
    getConfirmationConfigForNetwork(networkName);

  const sentTx = await txPromise;
  logger(
    `sent tx ${displayTxData(
      sentTx.hash
    )} and waiting for ${confirmationCount} confirmations`
  );

  const maybeTxReceipt = await Promise.race([
    sentTx.wait(confirmationCount),
    setTimeoutPromise(
      confirmationTimeoutInSeconds * 1000,
      new Error(`tx timed out after ${confirmationTimeoutInSeconds} seconds`)
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
  logger = (..._data: Array<any>) => {}
): Promise<{
  txReceipt: TransactionReceipt;
}> => {
  const { confirmationCount, confirmationTimeoutInSeconds } =
    getConfirmationConfigForNetwork(networkName);

  logger(
    `sent contract deploy tx ${displayTxData(
      deployTransaction.hash
    )} and waiting for ${confirmationCount} confirmations`
  );

  const maybeTxReceipt = await Promise.race([
    deployTransaction.wait(confirmationCount),
    setTimeoutPromise(
      confirmationTimeoutInSeconds * 1000,
      new Error(`tx timed out after ${confirmationTimeoutInSeconds} seconds`)
    ),
  ]);

  if (maybeTxReceipt instanceof Error) {
    throw maybeTxReceipt;
  }

  return { txReceipt: maybeTxReceipt };
};
