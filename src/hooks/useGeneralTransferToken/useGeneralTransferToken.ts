import { Signer } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNetwork, useSigner } from 'wagmi';
import { useAppDispatch } from '../../boot/store';
import { NetworkName, RootState } from '../../boot/types';
import { fetchProfileByAddress, selectUserById } from '../../features/profiles';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';

export const useGeneralTransferToken = (
  cardAddress: Address,
  fromAddress: Address,
  toAddress: Address,
  tokenId: number | null,
  network: NetworkName,
) => {
  const [transferState, setTransferState] = useState<STATUS>(STATUS.IDLE);
  const [error, setError] = useState();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const profile = useSelector((state: RootState) =>
    selectUserById(state.userData[network], fromAddress),
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (profile || !isAddress(fromAddress)) return;
    dispatch(fetchProfileByAddress({ address: fromAddress, network: network }));
  }, [dispatch, fromAddress, network, profile]);

  const transferCard = useCallback(async () => {
    if (chain?.name !== network) {
      toast('Wrong Network', { type: 'error', position: 'top-right' });
      return;
    }
    setTransferState(STATUS.LOADING);
    if (profile && profile.isOwnerKeyManager) {
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
      profile &&
        (await LSP3ProfileApi.transferCardViaUniversalProfile(
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
          }));
    }
  }, [cardAddress, network, chain?.name, profile, signer, toAddress, tokenId]);

  return {
    transferCard,
    transferState,
    error,
    resetState: () => setTransferState(STATUS.IDLE),
  };
};
