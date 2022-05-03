import { Signer } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IOwnedAssets } from '../../services/models';
import { Address } from '../../utils/types';

// @Todo fix type
interface IProfile {
  address: Address;
  owner: Address;
  isOwnerKeyManager: boolean;
  ownedAssets: IOwnedAssets[];
}

export const useTransferLsp8Token = (
  cardAddress: Address,
  toAddress: Address,
  tokenId: number | null,
  profile: IProfile,
  callback?: () => any,
) => {
  const [transfering, setTransfering] = useState(false);
  const [error, setError] = useState();
  const [{ data: signer }] = useSigner();

  const transferCard = async () => {
    setTransfering(true);
    if (profile.isOwnerKeyManager) {
      await KeyManagerApi.transferCardViaKeyManager(
        cardAddress,
        profile.address,
        profile.owner,
        tokenId ? tokenId : 0,
        toAddress,
        signer as Signer,
      )
        .then(() => {
          callback && callback();
        })
        .catch((error: any) => {
          setError(error);
        })
        .finally(() => {
          setTransfering(false);
        });
    } else {
      await LSP3ProfileApi.transferCardViaUniversalProfile(
        cardAddress,
        profile.address,
        tokenId ? tokenId : 0,
        toAddress,
        signer as Signer,
      )
        .then(() => {
          callback && callback();
        })
        .catch((error: any) => {
          setError(error);
        })
        .finally(() => {
          setTransfering(false);
        });
    }
  };

  return { transferCard, transfering, error };
};
