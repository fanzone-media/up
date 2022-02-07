import { ethers } from "ethers";

import type { BigNumberish } from "ethers";

export const tokenIdAsBytes32 = (tokenId: BigNumberish) => {
  return ethers.utils.hexZeroPad(
    ethers.BigNumber.from(tokenId).toHexString(),
    32
  );
};
