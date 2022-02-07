import { ethers } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types/runtime";

import type { Address, SignerWithAddress } from "./types";

export type NamedAccountsInHdWallet<T> = {
  owner: T;
  tokenReceiver: T;
  tokenBuyer: T;
  athlete: T;
  team: T;
  league: T;
  anyone: T;
};

export type NamedAccountsToSignerMap =
  NamedAccountsInHdWallet<SignerWithAddress>;

// TODO: remove NamedAccountsInHdWalletWithUniversalProfile, alreadyDeployedUniversalProfileContracts,
// getHdWalletAccounts
//
// these are not "needed" outside of the CardToken test scenario, and each test scenario should
// name accounts when calling `await hre.ethers.getSigners()`
//
// the setup-ecosystem can be changed so that only the owner is needed (and setup-named-accounts can
// include an athlete/team/league for default UniversalProfiles to use when testing)
export type NamedAccountsInHdWalletWithUniversalProfile<T> = Omit<
  NamedAccountsInHdWallet<T>,
  "anyone"
>;

// on non-local testnets & mainnet we expect profile contracts to already be deployed
export const alreadyDeployedUniversalProfileContracts: NamedAccountsInHdWalletWithUniversalProfile<string> =
  {
    owner: String(process.env.PROFILE_ADDRESS_OWNER),
    tokenReceiver: String(process.env.PROFILE_ADDRESS_TOKEN_RECEIVER),
    tokenBuyer: String(process.env.PROFILE_ADDRESS_TOKEN_BUYER),
    athlete: String(process.env.PROFILE_ADDRESS_ATHLETE),
    team: String(process.env.PROFILE_ADDRESS_TEAM),
    league: String(process.env.PROFILE_ADDRESS_LEAGUE),
  };

// NOTE: refer to hardhat.config.ts "accounts" property for how many accounts are available.
// The default is 20 (https://hardhat.org/config/#hd-wallet-config)
export const getHdWalletAccounts = async (
  hre: HardhatRuntimeEnvironment
): Promise<NamedAccountsToSignerMap> => {
  const [owner, tokenReceiver, tokenBuyer, athlete, team, league, anyone] =
    await hre.ethers.getSigners();

  return {
    owner,
    tokenReceiver,
    tokenBuyer,
    athlete,
    team,
    league,
    anyone,
  };
};

export const getPrivateKeyFromHdwallet = async (
  hre: HardhatRuntimeEnvironment,
  addressToFind: Address
): Promise<string> => {
  const hdwalletAddressList = await hre.ethers.getSigners();
  const hdwalletIndex = hdwalletAddressList
    .map((x) => x.address)
    .indexOf(addressToFind);

  if (hdwalletIndex === -1) {
    throw new Error(
      `getPrivateKeyFromHdwallet::ERROR address ${addressToFind} is not in hdwallet`
    );
  }

  const { address, privateKey } = ethers.Wallet.fromMnemonic(
    process.env.HARDHAT_TESTNET_MNEMONIC as string,
    `m/44'/60'/0'/0/${hdwalletIndex}`
  );

  // sanity check
  if (address !== addressToFind) {
    throw new Error(
      `getPrivateKeyFromHdwallet::INVARIANT found the address ${addressToFind} but after reading from hdwallet we have a different address ${address}`
    );
  }

  return privateKey;
};

export const getPrivateKeyBufferFromHdwallet = async (
  hre: HardhatRuntimeEnvironment,
  addressToFind: Address
): Promise<Buffer> => {
  const privateKey = await getPrivateKeyFromHdwallet(hre, addressToFind);

  return Buffer.from(privateKey.replace(/^0x/, ""), "hex");
};

export const generateNewWallet = async (
  ethers: HardhatRuntimeEnvironment["ethers"]
) => {
  const newWallet = ethers.Wallet.createRandom();
  const address = await newWallet.getAddress();
  const privateKey = newWallet.privateKey;

  return { address, privateKey };
};
