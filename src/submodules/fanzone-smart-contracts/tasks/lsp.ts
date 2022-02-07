import { TaskArguments, HardhatRuntimeEnvironment } from "hardhat/types";

import {
  fetchLSP3Data,
  fetchLSP4Data,
  fetchLSP5Data,
  fetchLSP6Data,
} from "../utils/LSPSchema";
import { displayOnChainData, displayOffChainData } from "../utils/display";
import { ERC725Y__factory } from "../typechain";

export const getLSP3Data = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { address } = args;

  console.log(
    `\ngetting LSP3 schema data for ${displayOnChainData(
      address
    )} on network ${displayOnChainData(hre.network.name)}\n`
  );

  const contract = ERC725Y__factory.connect(address, hre.ethers.provider);
  const metadata = await fetchLSP3Data(contract);

  console.log("metadata summary:\n", displayOffChainData(metadata));
};

export const getLSP4Data = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { address } = args;

  console.log(
    `\ngetting LSP4 schema data for ${displayOnChainData(
      address
    )} on network ${displayOnChainData(hre.network.name)}\n`
  );

  const contract = ERC725Y__factory.connect(address, hre.ethers.provider);
  const metadata = await fetchLSP4Data(contract);

  console.log("metadata summary:\n", displayOffChainData(metadata));
};

export const getLSP5Data = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { address } = args;

  console.log(
    `\ngetting LSP5 schema data for ${displayOnChainData(
      address
    )} on network ${displayOnChainData(hre.network.name)}\n`
  );

  const contract = ERC725Y__factory.connect(address, hre.ethers.provider);
  const metadata = await fetchLSP5Data(contract);

  console.log("metadata summary:\n", displayOffChainData(metadata));
};

export const getLSP6Data = async (
  args: TaskArguments,
  hre: HardhatRuntimeEnvironment
) => {
  const { address } = args;

  console.log(
    `\ngetting LSP6 schema data for ${displayOnChainData(
      address
    )} on network ${displayOnChainData(hre.network.name)}\n`
  );

  const contract = ERC725Y__factory.connect(address, hre.ethers.provider);
  const metadata = await fetchLSP6Data(contract);

  console.log("metadata summary:\n", displayOffChainData(metadata));
};
