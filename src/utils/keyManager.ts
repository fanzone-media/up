import { ethers } from 'ethers';
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import type { LSP6KeyManager } from '../submodules/fanzone-smart-contracts/typechain';

export type LSP6KeyManagerPermissions<T> = {
  CHANGE_OWNER: T;
  CHANGE_PERMISSIONS: T;
  ADD_PERMISSIONS: T;
  SET_DATA: T;
  CALL: T;
  STATIC_CALL: T;
  DELEGATE_CALL: T;
  DEPLOY: T;
  TRANSFER_VALUE: T;
  SIGN: T;
  ALL_PERMISSIONS: T;
};

// NOTE: permissions are determined with a bitmask of size byte32
//
// 0001 -> 1 (2^0)
// 0010 -> 2 (2^1)
// 0100 -> 4 (2^2)
export const LSP6_KEY_MANAGER_PERMISSIONS: LSP6KeyManagerPermissions<string> = {
  CHANGE_OWNER: ethers.utils.hexZeroPad('0x1', 32),
  CHANGE_PERMISSIONS: ethers.utils.hexZeroPad('0x2', 32),
  ADD_PERMISSIONS: ethers.utils.hexZeroPad('0x4', 32),
  SET_DATA: ethers.utils.hexZeroPad('0x8', 32),
  CALL: ethers.utils.hexZeroPad('0x10', 32),
  STATIC_CALL: ethers.utils.hexZeroPad('0x20', 32),
  DELEGATE_CALL: ethers.utils.hexZeroPad('0x40', 32),
  DEPLOY: ethers.utils.hexZeroPad('0x80', 32),
  TRANSFER_VALUE: ethers.utils.hexZeroPad('0x100', 32),
  SIGN: ethers.utils.hexZeroPad('0x200', 32),
  ALL_PERMISSIONS: ethers.utils.hexlify(ethers.constants.MaxUint256),
};

//
// --- encode permissions
//

export const encodePermissions = (
  permissions: LSP6KeyManagerPermissions<'true' | 'false'>,
) => {
  // override permissions to true if ALL_PERMISSIONS is set to true
  if (permissions.ALL_PERMISSIONS.toLowerCase() === 'true') {
    return LSP6_KEY_MANAGER_PERMISSIONS.ALL_PERMISSIONS;
  }

  const result = Object.keys(permissions).reduce((acc, key) => {
    const _key = key as keyof LSP6KeyManagerPermissions<'true' | 'false'>;
    if (permissions[_key] && permissions[_key].toLowerCase() === 'true') {
      return acc.or(LSP6_KEY_MANAGER_PERMISSIONS[_key]);
    } else {
      return acc;
    }
  }, ethers.BigNumber.from(0));

  return ethers.utils.hexZeroPad(ethers.utils.hexValue(result), 32);
};

//
// --- meta tx
//

export const buildKeyManagerMetaTx = async (
  keyManager: LSP6KeyManager,
  signer: SignerWithAddress,
  data: string,
  metaTxChannel: number | undefined = 0,
) => {
  const metaTxNonce = await keyManager.getNonce(signer.address, metaTxChannel);

  const metaTxSignature = await signer.signMessage(
    ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(
        ['address', 'uint256', 'bytes'],
        [keyManager.address, metaTxNonce, data],
      ),
    ),
  );

  return {
    metaTxNonce,
    metaTxSignature,
  };
};
