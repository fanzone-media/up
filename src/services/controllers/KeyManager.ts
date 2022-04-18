import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import {
  encodeArrayKey,
  encodeKeyValue,
} from '@erc725/erc725.js/build/main/lib/utils';
import { ethers, Signer } from 'ethers';
import {
  CardTokenProxy__factory,
  LSP6KeyManagerProxy__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import KeyChain from '../utilities/KeyChain';

const LSP6KeyManagerSchemaList: ERC725JSONSchema = {
  name: 'AddressPermissions[]',
  key: '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
  keyType: 'Array',
  valueContent: 'Number',
  valueType: 'uint256',
};

type permissionObject = {
  [k: string]: boolean;
};

const addPermissions = async (
  universalProfileAddress: string,
  address: string,
  permissions: permissionObject,
  signer: Signer,
) => {
  const encodedData = {
    keys: [],
    values: [],
  } as { keys: string[]; values: string[] };
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const owner = await universalProfileContract.owner();
  const KeyManagerContract = LSP6KeyManagerProxy__factory.connect(
    owner,
    signer,
  );

  const [currentIndex] = await universalProfileContract.getData([
    KeyChain.LSP6AddressPermissions,
  ]);
  const nextIndex =
    currentIndex === '0x' ? 0 : ethers.BigNumber.from(currentIndex).toNumber();

  const totalIndexvalue = encodeKeyValue(
    LSP6KeyManagerSchemaList.valueContent,
    LSP6KeyManagerSchemaList.valueType,
    String(nextIndex + 1),
    LSP6KeyManagerSchemaList.name,
  );
  encodedData.keys.push(LSP6KeyManagerSchemaList.key);
  encodedData.values.push(totalIndexvalue);

  const indexArrayKey = encodeArrayKey(LSP6KeyManagerSchemaList.key, nextIndex);
  encodedData.keys.push(indexArrayKey);
  encodedData.values.push(address);

  const encodedPermissionsKey = ERC725.encodeKeyName(
    `AddressPermissions:Permissions:${address.replace('0x', '')}`,
  );
  const encodedPermissionsValue = ERC725.encodePermissions(permissions);
  encodedData.keys.push(encodedPermissionsKey);
  encodedData.values.push(encodedPermissionsValue);

  const encodedSetDataFunction =
    universalProfileContract.interface.encodeFunctionData('setData', [
      encodedData.keys,
      encodedData.values,
    ]);

  await KeyManagerContract.execute(encodedSetDataFunction);
};

const transferCardViaKeyManager = async (
  assetAddress: string,
  universalProfileAddress: string,
  keyManagerAddress: string,
  tokenId: number,
  toAddress: string,
  signer: Signer,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );

  const encodedTransferFunction = assetContract.interface.encodeFunctionData(
    'transferFrom',
    [universalProfileAddress, toAddress, tokenId],
  );

  const encodedExecuteFunction =
    universalProfileContract.interface.encodeFunctionData('execute', [
      '0x0',
      assetAddress,
      0,
      encodedTransferFunction,
    ]);

  const transaction = await keyManagerContract.execute(encodedExecuteFunction);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const setCardMarketViaKeyManager = async (
  assetAddress: string,
  universalProfileAddress: string,
  keyManagerAddress: string,
  tokenId: number,
  acceptedToken: string,
  minimumAmount: number,
  signer: Signer,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );
  const tokenIdAsBytes = tokenIdAsBytes32(tokenId);
  const encodedSetMarketFor = assetContract.interface.encodeFunctionData(
    'setMarketFor',
    [tokenIdAsBytes, acceptedToken, minimumAmount],
  );
  const encodedExecuteFunction =
    universalProfileContract.interface.encodeFunctionData('execute', [
      '0x0',
      assetAddress,
      0,
      encodedSetMarketFor,
    ]);

  const transaction = await keyManagerContract.execute(encodedExecuteFunction);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

export const KeyManagerApi = {
  addPermissions,
  setCardMarketViaKeyManager,
  transferCardViaKeyManager,
};