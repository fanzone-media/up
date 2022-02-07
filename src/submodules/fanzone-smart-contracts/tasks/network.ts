import { ethers } from "ethers";

import { displayOnChainData } from "../utils/display";

import type { TaskArguments, HardhatRuntimeEnvironment } from "hardhat/types";

export const getTxCost = async (
  args: TaskArguments,
  _hre: HardhatRuntimeEnvironment
) => {
  const { gasUsed, gasPrice } = args;

  console.log(`\ncalculating tx cost with args ${args}\n`);

  const gasPriceGwei = ethers.utils.parseUnits(gasPrice, "gwei");
  const txCost = ethers.utils.formatUnits(gasPriceGwei.mul(gasUsed));

  console.log("tx cost:", displayOnChainData(txCost.toString()));
};
