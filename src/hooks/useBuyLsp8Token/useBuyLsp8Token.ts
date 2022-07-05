import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { STATUS } from '../../utility';

export const useBuyLsp8Token = (assetAddress: string, network: NetworkName) => {
  const [{ data: signer }] = useSigner();
  const [error, setError] = useState();
  const [buyingState, setBuyingState] = useState<STATUS>(STATUS.IDLE);

  const buyFromMarket = async (
    assetAddress: string,
    amount: BigNumber,
    tokenId: number,
    universalProfileAddress?: string,
  ) => {
    setBuyingState(STATUS.LOADING);
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
          .then(() => {
            setBuyingState(STATUS.SUCCESSFUL);
          })
          .catch((error) => {
            setError(error);
            setBuyingState(STATUS.FAILED);
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
          .then(() => {
            setBuyingState(STATUS.SUCCESSFUL);
          })
          .catch((error) => {
            setError(error);
            setBuyingState(STATUS.FAILED);
          }));
    } else {
      signer &&
        (await LSP4DigitalAssetApi.buyFromMarketViaEOA(
          assetAddress,
          tokenId,
          amount,
          signer,
        )
          .then(() => {
            setBuyingState(STATUS.SUCCESSFUL);
          })
          .catch((error) => {
            setError(error);
            setBuyingState(STATUS.FAILED);
          }));
    }
  };

  return { buyFromMarket, error, buyingState };
};
