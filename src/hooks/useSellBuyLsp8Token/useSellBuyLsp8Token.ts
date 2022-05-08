import { BigNumber, BigNumberish } from 'ethers';
import { useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { IProfile } from '../../services/models';
import { convertPrice } from '../../utility';

export const useSellBuyLsp8Token = (
  assetAddress: string,
  network: NetworkName,
) => {
  const [{ data: signer }] = useSigner();
  const [error, setError] = useState();
  const [{ data: account }] = useAccount();

  const buyFromMarket = async (
    assetAddress: string,
    amount: BigNumber,
    tokenId: number,
    universalProfileAddress?: string,
  ) => {
    const universalProfileCheck =
      universalProfileAddress &&
      (await LSP3ProfileApi.isUniversalProfile(
        universalProfileAddress,
        network,
      ));
    const owner =
      universalProfileAddress &&
      universalProfileCheck &&
      (await LSP3ProfileApi.fetchOwnerOfProfile(
        universalProfileAddress,
        network,
      ));
    const keyManagerCheck =
      owner && (await LSP3ProfileApi.checkKeyManager(owner, network));
    if (keyManagerCheck && owner && universalProfileAddress) {
      signer &&
        (await KeyManagerApi.buyFromCardMarketViaKeyManager(
          assetAddress,
          owner,
          universalProfileAddress,
          tokenId,
          amount,
          signer,
        ));
    }
    if (owner && universalProfileAddress) {
      signer &&
        (await LSP4DigitalAssetApi.buyFromCardMarketViaUniversalProfile(
          assetAddress,
          universalProfileAddress,
          tokenId,
          amount,
          signer,
        ));
    } else {
      signer &&
        (await LSP4DigitalAssetApi.buyFromMarketViaEOA(
          assetAddress,
          tokenId,
          amount,
          signer,
        ));
    }
  };

  const setForSale = async (
    assetAddress: string,
    ownerProfile: IProfile,
    mint: number,
    tokenAddress: string,
    amount: BigNumberish,
    decimals: number,
  ) => {
    if (ownerProfile.isOwnerKeyManager && signer) {
      await KeyManagerApi.setCardMarketViaKeyManager(
        assetAddress,
        ownerProfile.address,
        ownerProfile.owner,
        mint,
        tokenAddress,
        convertPrice(amount, decimals),
        signer,
      );
    }
    if (!ownerProfile.isOwnerKeyManager && signer) {
      await LSP4DigitalAssetApi.setMarketViaUniversalProfile(
        assetAddress,
        ownerProfile.address,
        mint,
        tokenAddress,
        convertPrice(amount, decimals),
        signer,
      );
    }
  };

  return { buyFromMarket, setForSale };
};
