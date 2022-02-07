import hre from "hardhat";
import { expect } from "chai";
import { ethers } from "ethers";

import {
  executeCallToUniversalProfileViaKeyManager,
  executeCallToUniversalProfileViaKeyManagerWithMetaTx,
} from "../../utils/universalProfile";
import { CardToken, LSP6KeyManager, UniversalProfile } from "../../typechain";
import {
  waitForTxOnNetwork,
  WaitForTxOnNetworkResult,
} from "../../utils/network";
import { buildKeyManagerMetaTx } from "../../utils/keyManager";

import type { BytesLike, ContractTransaction } from "ethers";
import type { Address, SignerWithAddress } from "../../utils/types";

//
// --- unpackCard
//

export type UnpackCardTxParams = {
  to: Address;
  tokenId: BytesLike;
};

const unpackCardScenarioPreAndPostConditions = async (
  cardToken: CardToken,
  txParams: UnpackCardTxParams,
  operator: Address,
  sendTransaction: () => Promise<ContractTransaction>
): Promise<WaitForTxOnNetworkResult> => {
  // pre-conditions
  try {
    const preTokenOwnerOf = await cardToken.tokenOwnerOf(txParams.tokenId);

    throw new Error(
      `tokenId ${txParams.tokenId} is already owned by ${preTokenOwnerOf}`
    );
  } catch (error: any) {
    const expectedError = "LSP8: can not query non existent token";
    // expecting this to fail
    if (error.message.indexOf(expectedError) === -1) {
      throw error;
    }
  }

  try {
    const preMetadataAddressOf = await cardToken.metadataAddressOf(
      txParams.tokenId
    );

    throw new Error(
      `tokenId ${txParams.tokenId} metadata already exists ${preMetadataAddressOf}`
    );
  } catch (error: any) {
    const expectedError = "LSP8Metadata: metadata query for nonexistent token";
    if (error.message.indexOf(expectedError) === -1) {
      throw error;
    }
  }

  const [preTokenSupply, preMintableSupply, preToBalanceOf] = await Promise.all(
    [
      cardToken.totalSupply(),
      cardToken.mintableSupply(),
      cardToken.balanceOf(txParams.to),
    ]
  );

  expect(preMintableSupply.gt(0)).to.eq(true, "must start with mintableSupply");

  // effects
  const txResult = await waitForTxOnNetwork(
    hre.network.name,
    sendTransaction()
  );

  await expect(txResult.sentTx)
    .to.emit(cardToken, "Transfer(address,address,address,bytes32,bool,bytes)")
    .withArgs(
      operator,
      ethers.constants.AddressZero,
      txParams.to,
      txParams.tokenId,
      true, // expected from CardToken.unpackCard
      ethers.utils.toUtf8Bytes("")
    );

  await expect(txResult.sentTx)
    .to.emit(cardToken, "Transfer(address,address,uint256)")
    .withArgs(
      ethers.constants.AddressZero,
      txParams.to,
      ethers.BigNumber.from(txParams.tokenId).toString()
    );

  // post-conditions
  const [
    postTokenSupply,
    postMintableSupply,
    postMetadataAddressOf,
    postTokenOwnerOf,
    postToBalanceOf,
  ] = await Promise.all([
    cardToken.totalSupply(),
    cardToken.mintableSupply(),
    cardToken.metadataAddressOf(txParams.tokenId),
    cardToken.tokenOwnerOf(txParams.tokenId),
    cardToken.balanceOf(txParams.to),
  ]);

  expect(postTokenSupply).to.eq(
    preTokenSupply.add(1),
    "tokenSupply increases by one"
  );
  expect(postMintableSupply).to.eq(
    preMintableSupply.sub(1),
    "mintableSupply decreases by one"
  );
  expect(postMetadataAddressOf).to.eq(
    ethers.constants.AddressZero,
    "metadata not set during unpackCard"
  );
  expect(postTokenOwnerOf).to.eq(
    txParams.to,
    "to address owns the minted token"
  );
  expect(postToBalanceOf).to.eq(
    preToBalanceOf.add(1),
    "to address balanceOf increases by one"
  );

  return txResult;
};

export const unpackCardScenarioToEOA = async (
  cardToken: CardToken,
  txParams: UnpackCardTxParams,
  signer: SignerWithAddress
): Promise<WaitForTxOnNetworkResult> => {
  const operator = signer.address;
  const sendTransaction = async () =>
    cardToken.connect(signer).unpackCard(txParams.to, txParams.tokenId);

  return unpackCardScenarioPreAndPostConditions(
    cardToken,
    txParams,
    operator,
    sendTransaction
  );
};

export const encodeUnpackCardTxDataForUniversalProfile = (
  cardToken: CardToken,
  txParams: UnpackCardTxParams,
  universalProfile: UniversalProfile
) => {
  const unpackCardTxData = cardToken.interface.encodeFunctionData(
    "unpackCard",
    [txParams.to, txParams.tokenId]
  );

  const universalProfileExecuteTxData =
    universalProfile.interface.encodeFunctionData("execute", [
      "0x0",
      cardToken.address,
      "0",
      unpackCardTxData,
    ]);

  return universalProfileExecuteTxData;
};

export const unpackCardScenarioToUniversalProfileViaKeyManager = async (
  cardToken: CardToken,
  txParams: UnpackCardTxParams,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager
): Promise<WaitForTxOnNetworkResult> => {
  const operator = universalProfile.address;
  const sendTransaction = async () => {
    return executeCallToUniversalProfileViaKeyManager(
      keyManager,
      encodeUnpackCardTxDataForUniversalProfile(
        cardToken,
        txParams,
        universalProfile
      )
    );
  };

  return unpackCardScenarioPreAndPostConditions(
    cardToken,
    txParams,
    operator,
    sendTransaction
  );
};

export const unpackCardScenarioToUniversalProfileViaKeyManagerWithMetaTx =
  async (
    cardToken: CardToken,
    txParams: UnpackCardTxParams,
    universalProfile: UniversalProfile,
    keyManager: LSP6KeyManager,
    signer: SignerWithAddress
  ): Promise<WaitForTxOnNetworkResult> => {
    const operator = universalProfile.address;
    const sendTransaction = async () => {
      const universalProfileExecuteTxData =
        encodeUnpackCardTxDataForUniversalProfile(
          cardToken,
          txParams,
          universalProfile
        );

      const { metaTxNonce, metaTxSignature } = await buildKeyManagerMetaTx(
        keyManager,
        signer,
        universalProfileExecuteTxData
      );

      return executeCallToUniversalProfileViaKeyManagerWithMetaTx(
        keyManager.connect(signer),
        universalProfileExecuteTxData,
        metaTxNonce,
        metaTxSignature
      );
    };

    return unpackCardScenarioPreAndPostConditions(
      cardToken,
      txParams,
      operator,
      sendTransaction
    );
  };

//
// --- transferFrom
//
export type TransferFromTxParams = {
  from: Address;
  to: Address;
  tokenId: BytesLike;
};

const transferFromScenarioPreAndPostConditions = async (
  cardToken: CardToken,
  txParams: TransferFromTxParams,
  operator: Address,
  sendTransaction: () => Promise<ContractTransaction>
): Promise<WaitForTxOnNetworkResult> => {
  // pre-conditions
  const [preTokenOwnerOf, preAllTokenHolders] = await Promise.all([
    cardToken.tokenOwnerOf(txParams.tokenId),
    // TODO: only here to satisfy LSP4DigitalCertificate `tokenHolders`
    cardToken.allTokenHolders(),
  ]);

  expect(preTokenOwnerOf).to.eq(
    ethers.utils.getAddress(txParams.from),
    "tokenId is owned by from address"
  );
  expect(
    preAllTokenHolders.includes(
      ethers.utils.hexZeroPad(txParams.from.toLowerCase(), 32)
    )
  ).to.eq(true, "from address should start as a token holder");

  // effects
  const txResult = await waitForTxOnNetwork(
    hre.network.name,
    sendTransaction()
  );

  await expect(txResult.sentTx)
    .to.emit(cardToken, "Transfer(address,address,address,bytes32,bool,bytes)")
    .withArgs(
      operator,
      txParams.from,
      txParams.to,
      txParams.tokenId,
      true, // expected from LSP8CompatibilityForERC721.transferFrom
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes("compat-transferFrom"))
    );

  await expect(txResult.sentTx)
    .to.emit(cardToken, "Transfer(address,address,uint256)")
    .withArgs(
      txParams.from,
      txParams.to,
      ethers.BigNumber.from(txParams.tokenId).toString()
    );

  // post-conditions
  const [postTokenOwnerOf, postAllTokenHolders] = await Promise.all([
    cardToken.tokenOwnerOf(txParams.tokenId),
    // TODO: only here to satisfy LSP4DigitalCertificate `tokenHolders`
    cardToken.allTokenHolders(),
  ]);
  expect(postTokenOwnerOf).to.eq(
    ethers.utils.getAddress(txParams.to),
    "tokenId is owned by to address"
  );
  expect(
    postAllTokenHolders.includes(
      ethers.utils.hexZeroPad(txParams.to.toLowerCase(), 32)
    )
  ).to.eq(true, "to address should end as a token holder");

  return txResult;
};

export const transferFromScenarioToEOA = async (
  cardToken: CardToken,
  txParams: TransferFromTxParams,
  signer: SignerWithAddress
) => {
  const operator = signer.address;
  const sendTransaction = async () =>
    cardToken
      .connect(signer)
      .transferFrom(txParams.from, txParams.to, txParams.tokenId);

  return transferFromScenarioPreAndPostConditions(
    cardToken,
    txParams,
    operator,
    sendTransaction
  );
};

export const encodeTransferFromTxDataForUniversalProfile = (
  cardToken: CardToken,
  txParams: TransferFromTxParams,
  universalProfile: UniversalProfile
) => {
  const transferFromTxData = cardToken.interface.encodeFunctionData(
    "transferFrom",
    [txParams.from, txParams.to, txParams.tokenId]
  );

  const universalProfileExecuteTxData =
    universalProfile.interface.encodeFunctionData("execute", [
      "0x0",
      cardToken.address,
      "0",
      transferFromTxData,
    ]);

  return universalProfileExecuteTxData;
};

export const transferFromScenarioToUniversalProfileViaKeyManager = (
  cardToken: CardToken,
  txParams: TransferFromTxParams,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager
) => {
  const operator = universalProfile.address;
  const sendTransaction = async () => {
    return executeCallToUniversalProfileViaKeyManager(
      keyManager,
      encodeTransferFromTxDataForUniversalProfile(
        cardToken,
        txParams,
        universalProfile
      )
    );
  };

  return transferFromScenarioPreAndPostConditions(
    cardToken,
    txParams,
    operator,
    sendTransaction
  );
};

export const transferFromScenarioToUniversalProfileViaKeyManagerWithMetaTx = (
  cardToken: CardToken,
  txParams: TransferFromTxParams,
  universalProfile: UniversalProfile,
  keyManager: LSP6KeyManager,
  signer: SignerWithAddress
) => {
  const operator = universalProfile.address;
  const sendTransaction = async () => {
    const universalProfileExecuteTxData =
      encodeTransferFromTxDataForUniversalProfile(
        cardToken,
        txParams,
        universalProfile
      );

    const { metaTxNonce, metaTxSignature } = await buildKeyManagerMetaTx(
      keyManager,
      signer,
      universalProfileExecuteTxData
    );

    return executeCallToUniversalProfileViaKeyManagerWithMetaTx(
      keyManager.connect(signer),
      universalProfileExecuteTxData,
      metaTxNonce,
      metaTxSignature
    );
  };

  return transferFromScenarioPreAndPostConditions(
    cardToken,
    txParams,
    operator,
    sendTransaction
  );
};

//
// --- createMetadataFor
//

export type CreateMetadataForTxParams = {
  tokenId: BytesLike;
};

export const encodeCreateMetadataForTxDataForUniversalProfile = (
  cardToken: CardToken,
  txParams: CreateMetadataForTxParams,
  universalProfile: UniversalProfile
) => {
  const unpackCardTxData = cardToken.interface.encodeFunctionData(
    "createMetadataFor",
    [txParams.tokenId]
  );

  const universalProfileExecuteTxData =
    universalProfile.interface.encodeFunctionData("execute", [
      "0x0",
      cardToken.address,
      "0",
      unpackCardTxData,
    ]);

  return universalProfileExecuteTxData;
};
