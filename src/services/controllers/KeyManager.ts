import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js';
import {
  encodeArrayKey,
  encodeKeyValue,
} from '@erc725/erc725.js/build/main/lib/utils';
import { BigNumberish, BytesLike, ethers, Signer } from 'ethers';
import {
  CardMarket__factory,
  CardTokenProxy__factory,
  ERC20__factory,
  LSP6KeyManagerProxy__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import { Address } from '../../utils/types';
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

const approveTokenViaKeyManager = async (
  keyManagerAddress: string,
  universalProfileAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  amount: number,
  signer: Signer,
) => {
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );
  const erc20Contract = ERC20__factory.connect(tokenAddress, signer);
  const encodedApprove = erc20Contract.interface.encodeFunctionData('approve', [
    spenderAddress,
    amount.toString(),
  ]);

  const encodedExecuteFunction =
    universalProfileContract.interface.encodeFunctionData('execute', [
      '0x0',
      tokenAddress,
      0,
      encodedApprove,
    ]);

  const transaction = await keyManagerContract.execute(encodedExecuteFunction);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const buyFromCardMarketViaKeyManager = async (
  assetAddress: string,
  keyManagerAddress: string,
  universalProfileAddress: string,
  tokenId: number,
  minimumAmount: number,
  signer: Signer,
  referrerAddress: Address,
) => {
  const assetContract = CardTokenProxy__factory.connect(assetAddress, signer);
  const tokenIdBytes = tokenIdAsBytes32(tokenId);
  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );

  const encodedBuyFromMarket = assetContract.interface.encodeFunctionData(
    'buyFromMarket',
    [tokenIdBytes, minimumAmount.toString(), referrerAddress],
  );

  const encodedExecuteFunction =
    universalProfileContract.interface.encodeFunctionData('execute', [
      '0x0',
      assetAddress,
      0,
      encodedBuyFromMarket,
    ]);

  const transaction = await keyManagerContract.execute(encodedExecuteFunction);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const transferBalanceViaKeyManager = async (
  tokenAddress: string,
  keyManagerAddress: string,
  universalProfileAddress: string,
  amountToTransfer: BigNumberish,
  toAddress: string,
  signer: Signer,
) => {
  const tokenContract = ERC20__factory.connect(tokenAddress, signer);
  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );
  const encodedTransfer = tokenContract.interface.encodeFunctionData(
    'transfer',
    [toAddress, amountToTransfer],
  );

  const encodedExecuteFunction =
    universalProfileContract.interface.encodeFunctionData('execute', [
      '0x0',
      tokenAddress,
      0,
      encodedTransfer,
    ]);
  const transaction = await keyManagerContract.execute(encodedExecuteFunction);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};
const removeMarketViaKeymanager = async (
  assetAddress: string,
  universalProfileAddress: string,
  keyManagerAddress: string,
  tokenId: BytesLike,
  signer: Signer,
) => {
  const assetContract = CardMarket__factory.connect(assetAddress, signer);
  const universalProfileContract = UniversalProfileProxy__factory.connect(
    universalProfileAddress,
    signer,
  );

  const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );

  const encodedRemoveMarketForFunction =
    assetContract.interface.encodeFunctionData('removeMarketFor', [tokenId]);

  const encodedExecuteFunction =
    universalProfileContract.interface.encodeFunctionData('execute', [
      '0x0',
      assetAddress,
      0,
      encodedRemoveMarketForFunction,
    ]);

  const transaction = await keyManagerContract.execute(encodedExecuteFunction);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

const executeTransactionViaKeyManager = async (
  keyManagerAddress: Address,
  encodedData: string,
  signer: Signer,
) => {
  const contract = LSP6KeyManagerProxy__factory.connect(
    keyManagerAddress,
    signer,
  );
  const transaction = await contract.execute(encodedData);
  await transaction.wait(1).then((result) => {
    if (result.status === 0) {
      throw new Error('Transaction reverted');
    }
  });
};

export const KeyManagerApi = {
  addPermissions,
  transferCardViaKeyManager,
  approveTokenViaKeyManager,
  buyFromCardMarketViaKeyManager,
  transferBalanceViaKeyManager,
  removeMarketViaKeymanager,
  executeTransactionViaKeyManager,
};
