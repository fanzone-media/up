import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import {
  AuctionApi,
  auctionContracts,
} from '../../services/controllers/Auction';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';

export const useSubmitBid = (
  assetAddress: Address,
  tokenId: number,
  network: NetworkName,
) => {
  const [bidingState, setbidingState] = useState<STATUS>(STATUS.IDLE);
  const [{ data: signer }] = useSigner();

  const submitBid = async (bidAmount: number, upAddress: Address) => {
    if (!signer) return;

    setbidingState(STATUS.LOADING);
    try {
      const isUp = await LSP3ProfileApi.isUniversalProfile(upAddress, network);

      if (!isUp) throw new Error('not a universal profile');

      const upOwnerAddress = await LSP3ProfileApi.fetchOwnerOfProfile(
        upAddress,
        network,
      );

      const iskeyManager = await LSP3ProfileApi.checkKeyManager(
        upOwnerAddress,
        network,
      );

      const encodedAuctionData = AuctionApi.encodeSubmitBid(
        assetAddress,
        tokenId,
        bidAmount,
        signer,
        network,
      );

      if (iskeyManager) {
        const encodedExecuteData = LSP3ProfileApi.encodeExecute(
          upAddress,
          auctionContracts[network],
          encodedAuctionData,
          signer,
        );

        await KeyManagerApi.executeTransactionViaKeyManager(
          upOwnerAddress,
          encodedExecuteData,
          signer,
        );

        setbidingState(STATUS.SUCCESSFUL);

        return;
      }

      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        upAddress,
        auctionContracts[network],
        encodedAuctionData,
        signer,
      );

      setbidingState(STATUS.SUCCESSFUL);
    } catch (error) {
      setbidingState(STATUS.FAILED);
    }
  };

  return { bidingState, submitBid };
};
