import { Signer } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNetwork, useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
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
  network: NetworkName,
) => {
  const [transferState, setTransferState] = useState<STATUS>(STATUS.IDLE);
  const [error, setError] = useState();
  const [{ data: signer }] = useSigner();
  const [{ data: networkData }] = useNetwork();

  const transferCard = async () => {
    if (networkData.chain?.name !== network) {
      toast('Wrong Network', { type: 'error', position: 'top-right' });
      return;
    }
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
