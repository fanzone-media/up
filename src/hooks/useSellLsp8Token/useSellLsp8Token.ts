import { BigNumberish } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNetwork, useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { IProfile } from '../../services/models';
import { convertPrice, STATUS } from '../../utility';

export const useSellLsp8Token = () => {
  const [{ data: signer }] = useSigner();
  const [{ data: networkData }] = useNetwork();
  const [error, setError] = useState();
  const [sellState, setSellState] = useState<STATUS>(STATUS.IDLE);

  const setForSale = async (
    assetAddress: string,
    ownerProfile: IProfile,
    mint: number,
    tokenAddress: string,
    amount: BigNumberish,
    decimals: number,
    network: NetworkName,
  ) => {
    if (networkData.chain?.name !== network) {
      toast('Wrong Network', { type: 'error', position: 'top-right' });
      return;
    }
    setSellState(STATUS.LOADING);
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
        .then(() => {
          setSellState(STATUS.SUCCESSFUL);
        })
        .catch((error) => {
          setError(error);
          setSellState(STATUS.FAILED);
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
        .then(() => {
          setSellState(STATUS.SUCCESSFUL);
        })
        .catch((error) => {
          setError(error);
          setSellState(STATUS.FAILED);
        });
    }
  };

  return {
    sellState,
    setForSale,
    error,
    resetState: () => setSellState(STATUS.IDLE),
  };
};
