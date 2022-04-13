import type { Overrides } from "@ethersproject/contracts";

export const prepareTxOverrides = (overrides: Overrides): Overrides => {
  // we want to always use tx.type 2 (EIP-1559)
  const modifiedOverrides = { ...overrides, type: 2 };

  if (overrides.gasPrice != null) {
    modifiedOverrides.maxFeePerGas = overrides.gasPrice;
    modifiedOverrides.maxPriorityFeePerGas = overrides.gasPrice;
    delete modifiedOverrides.gasPrice;
  }

  return modifiedOverrides;
};
