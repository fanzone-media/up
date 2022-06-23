import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';

export const useBuyLsp8Token = (assetAddress: string, network: NetworkName) => {
  const [{ data: signer }] = useSigner();
  const [error, setError] = useState();
  const [isBuying, setIsBuying] = useState<boolean>(false);

  const buyFromMarket = async (
    assetAddress: string,
    amount: BigNumber,
    tokenId: number,
    universalProfileAddress?: string,
  ) => {
    setIsBuying(true);
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
        )
          .catch((error) => {
            setError(error);
          })
          .finally(() => {
            setIsBuying(false);
          }));
    }
    if (owner && universalProfileAddress) {
      signer &&
        (await LSP4DigitalAssetApi.buyFromCardMarketViaUniversalProfile(
          assetAddress,
          universalProfileAddress,
          tokenId,
          amount,
          signer,
        )
          .catch((error) => {
            setError(error);
          })
          .finally(() => {
            setIsBuying(false);
          }));
    } else {
      signer &&
        (await LSP4DigitalAssetApi.buyFromMarketViaEOA(
          assetAddress,
          tokenId,
          amount,
          signer,
        )
          .catch((error) => {
            setError(error);
          })
          .finally(() => {
            setIsBuying(false);
          }));
    }
  };

  return { buyFromMarket, error, isBuying };
};
