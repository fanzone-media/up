import assert from "assert";
import { ethers } from "ethers";
import { TaskArguments, HardhatRuntimeEnvironment } from "hardhat/types";

import {
  getHdWalletAccounts,
  NamedAccountsInHdWallet,
} from "../utils/hdwallet";
import { displayOnChainData } from "../utils/display";

export const getBalances = async (
  _args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  console.log(
    `\ngetting balances on network ${displayOnChainData(hre.network.name)}\n`
  );

  const accounts = await getHdWalletAccounts(hre);

  const balanceSummary = await Promise.all(
    Object.keys(accounts).map(async (accountName) => {
      const { address } =
        accounts[accountName as keyof NamedAccountsInHdWallet<string>];
      const rawBalance = await hre.ethers.provider.getBalance(address);
      const balance = ethers.utils.formatEther(rawBalance);

      return { accountName, address, balance };
    })
  );

  console.log("balances summary:\n", displayOnChainData(balanceSummary));
};

export const getPrivateKeys = async (
  _args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  console.log("\ngetting private keys from hdwallet\n");

  const accounts = await getHdWalletAccounts(hre);
  const mnemonic = process.env.HARDHAT_TESTNET_MNEMONIC as string;

  const keySummary = Object.keys(accounts).map((accountName, index) => {
    // we can access private keys by the entry in the hdwallet
    const { address, privateKey } = ethers.Wallet.fromMnemonic(
      mnemonic,
      `m/44'/60'/0'/0/${index}`
    );

    // NOTE: nodejs is correctly building the Object.keys list based on order of insertion to the
    // accounts map.. this could change, so we must check here
    assert(
      accounts[accountName as keyof NamedAccountsInHdWallet<string>].address ===
        address,
      "address mismatch when building hdwallet path"
    );

    return { accountName, address, privateKey };
  });

  console.log("private keys summary:\n", displayOnChainData(keySummary));
};
