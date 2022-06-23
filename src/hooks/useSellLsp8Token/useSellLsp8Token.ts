import { BigNumberish } from 'ethers';
import { useState } from 'react';
import { useNetwork, useSigner } from 'wagmi';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { IProfile } from '../../services/models';
import { convertPrice } from '../../utility';

export const useSellLsp8Token = () => {
  const [{ data: signer }] = useSigner();
  const [error, setError] = useState();
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const [{ data }] = useNetwork();

  const setForSale = async (
    assetAddress: string,
    ownerProfile: IProfile,
    mint: number,
    tokenAddress: string,
    amount: BigNumberish,
    decimals: number,
  ) => {
    setIsSelling(true);
    if (ownerProfile.isOwnerKeyManager && signer) {
      await KeyManagerApi.setCardMarketViaKeyManager(
        assetAddress,
        ownerProfile.address,
        ownerProfile.owner,
        mint,
        tokenAddress,
        convertPrice(amount, decimals),
        signer,
      )
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setIsSelling(false);
        });
    }
    if (!ownerProfile.isOwnerKeyManager && signer) {
      await LSP4DigitalAssetApi.setMarketViaUniversalProfile(
        assetAddress,
        ownerProfile.address,
        mint,
        tokenAddress,
        convertPrice(amount, decimals),
        signer,
      )
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setIsSelling(false);
        });
    }
  };

  return { isSelling, setForSale, error };
};
