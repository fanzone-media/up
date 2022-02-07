import { ethers } from "ethers";

export const vanityNameAsBytes32 = (vanityName: string) => {
  return ethers.utils.formatBytes32String(vanityName);
};
