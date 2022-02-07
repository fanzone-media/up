import type { BigNumberish } from "ethers";
import type { LSP6KeyManager, UniversalProfile } from "../typechain";
import type { Address } from "./types";

// NOTE: we must specify gas limit here.. it seems on l14 ethers doesnt get a good gas limit from
// `estimateGas` when we are doing this dynamic calls
export const universalProfileGasLimit = {
  execute: process.env.GAS_LIMIT_PROFILE_EXECUTE || "0",
};

// possible op codes, from ERC725X.sol
//
// uint256 constant OPERATION_CALL = 0;
// uint256 constant OPERATION_DELEGATECALL = 1;
// uint256 constant OPERATION_CREATE2 = 2;
// uint256 constant OPERATION_CREATE = 3;
const operationCode = {
  call: "0x0",
  delegatecall: "0x1",
  create2: "0x2",
  create: "0x3",
};

// TODO replace all "0x0"
export const encodeTxDataForUniversalProfileExecuteCall = (
  universalProfile: UniversalProfile,
  to: Address,
  encodedTxData: string,
  valueToSend: BigNumberish = "0"
) => {
  return universalProfile.interface.encodeFunctionData("execute", [
    operationCode.call,
    to,
    valueToSend,
    encodedTxData,
  ]);
};

export const executeCallViaUniversalProfile = (
  universalProfile: UniversalProfile,
  addressToCall: Address,
  encodedTxData: string,
  valueToSend: BigNumberish = "0"
) => {
  return universalProfile.execute(
    operationCode.call,
    addressToCall,
    valueToSend,
    encodedTxData,
    { gasLimit: universalProfileGasLimit.execute }
  );
};

export const executeCallToUniversalProfileViaKeyManager = (
  keyManager: LSP6KeyManager,
  encodedTxData: string
) => {
  return keyManager.execute(encodedTxData, {
    gasLimit: universalProfileGasLimit.execute,
  });
};

export const executeCallToUniversalProfileViaKeyManagerWithMetaTx = (
  keyManager: LSP6KeyManager,
  encodedTxData: string,
  nonce: BigNumberish,
  signature: string
) => {
  return keyManager.executeRelayCall(
    keyManager.address,
    nonce,
    encodedTxData,
    signature,
    {
      gasLimit: universalProfileGasLimit.execute,
    }
  );
};
