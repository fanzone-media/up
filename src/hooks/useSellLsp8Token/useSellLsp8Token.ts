import { BigNumberish } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNetwork, useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { IProfile } from '../../services/models';
import { convertPrice, STATUS } from '../../utility';

export const useSellLsp8Token = () => {
  const [{ data: signer }] = useSigner();
  const [{ data: networkData }] = useNetwork();
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
    if (!signer) {
      toast('wallet not connected', { type: 'error', position: 'top-right' });
      return;
    }
    if (networkData.chain?.name !== network) {
      toast('Wrong Network', { type: 'error', position: 'top-right' });
      return;
    }

    setSellState(STATUS.LOADING);
    try {
      const encodedSetMarketForData = LSP4DigitalAssetApi.encodeSetMarketFor(
        assetAddress,
        mint,
        tokenAddress,
        convertPrice(amount, decimals),
        signer,
      );

      if (ownerProfile.isOwnerKeyManager) {
        const encodedExecuteData = LSP3ProfileApi.encodeExecute(
          ownerProfile.address,
          assetAddress,
          encodedSetMarketForData,
          signer,
        );

        await KeyManagerApi.executeTransactionViaKeyManager(
          ownerProfile.owner,
          encodedExecuteData,
          signer,
        );

        setSellState(STATUS.SUCCESSFUL);

        return;
      }
      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        ownerProfile.address,
        assetAddress,
        encodedSetMarketForData,
        signer,
      );

      setSellState(STATUS.SUCCESSFUL);
    } catch (error) {
      setSellState(STATUS.FAILED);
    }
  };

  return {
    sellState,
    setForSale,
    resetState: () => setSellState(STATUS.IDLE),
  };
};
