import { Signer } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IOwnedAssets } from '../../services/models';
import { STATUS } from '../../utility';
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
) => {
  const [transferState, setTransferState] = useState<STATUS>(STATUS.IDLE);
  const [error, setError] = useState();
  const [{ data: signer }] = useSigner();

  const transferCard = async () => {
    setTransferState(STATUS.LOADING);
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
          setTransferState(STATUS.SUCCESSFUL);
        })
        .catch((error) => {
          setError(error);
          setTransferState(STATUS.FAILED);
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
          setTransferState(STATUS.SUCCESSFUL);
        })
        .catch((error) => {
          setError(error);
          setTransferState(STATUS.FAILED);
        });
    }
  };

  return {
    transferCard,
    transferState,
    error,
    resetState: () => setTransferState(STATUS.IDLE),
  };
};
