import { Signer } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IOwnedAssets } from '../../services/models';
import { STATUS } from '../../utility';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import { Address } from '../../utils/types';

// @Todo fix type
interface IProfile {
  address: Address;
  owner: Address;
  isOwnerKeyManager: boolean;
  ownedAssets: IOwnedAssets[];
}

export const useRemoveMarketForLsp8Token = (
  cardAddress: Address,
  tokenId: number | null,
  profile: IProfile,
  callback?: () => any,
) => {
  const [removeMarketState, setRemovingMarketState] = useState<STATUS>(
    STATUS.IDLE,
  );
  const [error, setError] = useState();
  const { data: signer } = useSigner();

  const removeMarket = async () => {
    setRemovingMarketState(STATUS.LOADING);
    if (profile.isOwnerKeyManager) {
      await KeyManagerApi.removeMarketViaKeymanager(
        cardAddress,
        profile.address,
        profile.owner,
        tokenId ? tokenIdAsBytes32(tokenId) : tokenIdAsBytes32(0),
        signer as Signer,
      )
        .then(() => {
          setRemovingMarketState(STATUS.SUCCESSFUL);
          callback && callback();
        })
        .catch((error: any) => {
          setError(error);
          setRemovingMarketState(STATUS.FAILED);
        });
    } else {
      await LSP3ProfileApi.removeMarket(
        cardAddress,
        profile.address,
        tokenId ? tokenIdAsBytes32(tokenId) : tokenIdAsBytes32(0),
        signer as Signer,
      )
        .then(() => {
          setRemovingMarketState(STATUS.SUCCESSFUL);
          callback && callback();
        })
        .catch((error: any) => {
          setError(error);
          setRemovingMarketState(STATUS.FAILED);
        });
    }
  };

  return { removeMarket, removeMarketState, error };
};
