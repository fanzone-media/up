import { prepareTxOverrides } from './transaction';

import type { BigNumberish } from 'ethers';
import type {
  LSP6KeyManager,
  UniversalProfile,
} from '../submodules/fanzone-smart-contracts/typechain';
import type { Address, TxOverrides } from './types';

// NOTE: we must specify gas limit here.. it seems on l14 ethers doesnt get a good gas limit from
// `estimateGas` when we are doing this dynamic calls
export const universalProfileGasLimit = {
  execute: process.env.GAS_LIMIT_PROFILE_EXECUTE || '0',
};

// possible op codes, from ERC725X.sol
//
// uint256 constant OPERATION_CALL = 0;
// uint256 constant OPERATION_DELEGATECALL = 1;
// uint256 constant OPERATION_CREATE2 = 2;
// uint256 constant OPERATION_CREATE = 3;
const operationCode = {
  call: '0x0',
  create: '0x1',
  create2: '0x2',
  staticcall: '0x3',
  delegatecall: '0x4',
};

export const encodeTxDataForUniversalProfileExecuteCall = (
  universalProfile: UniversalProfile,
  to: Address,
  encodedTxData: string,
  valueToSend: BigNumberish = '0',
) => {
  return universalProfile.interface.encodeFunctionData('execute', [
    operationCode.call,
    to,
    valueToSend,
    encodedTxData,
  ]);
};

export const executeCallViaUniversalProfile = (
  txOverrides: TxOverrides,
  universalProfile: UniversalProfile,
  addressToCall: Address,
  encodedTxData: string,
  valueToSend: BigNumberish = '0',
) => {
  return universalProfile.execute(
    operationCode.call,
    addressToCall,
    valueToSend,
    encodedTxData,
    {
      ...prepareTxOverrides(txOverrides),
      gasLimit: universalProfileGasLimit.execute,
    },
  );
};

export const executeCallToUniversalProfileViaKeyManager = (
  txOverrides: TxOverrides,
  keyManager: LSP6KeyManager,
  encodedTxData: string,
) => {
  return keyManager.execute(encodedTxData, {
    ...prepareTxOverrides(txOverrides),
    gasLimit: universalProfileGasLimit.execute,
  });
};

export const executeCallToUniversalProfileViaKeyManagerWithMetaTx = (
  txOverrides: TxOverrides,
  keyManager: LSP6KeyManager,
  encodedTxData: string,
  nonce: BigNumberish,
  signature: string,
) => {
  return keyManager.executeRelayCall(
    keyManager.address,
    nonce,
    encodedTxData,
    signature,
    {
      ...prepareTxOverrides(txOverrides),
      gasLimit: universalProfileGasLimit.execute,
    },
  );
};
