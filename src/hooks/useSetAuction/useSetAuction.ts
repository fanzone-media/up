import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import {
  AuctionApi,
  auctionContracts,
} from '../../services/controllers/Auction';
import { Address } from '../../utils/types';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { STATUS } from '../../utility';
import { IProfile } from '../../services/models';

export const useSetAuction = () => {
  const [auctioningState, setAuctioningState] = useState<STATUS>(STATUS.IDLE);
  const [{ data: signer }] = useSigner();

  const setForAuction = async (
    profile: IProfile,
    assetAddress: Address,
    tokenId: number,
    duration: number,
    minimumBid: number,
    acceptedToken: Address,
    network: NetworkName,
  ) => {
    setAuctioningState(STATUS.LOADING);
    if (!signer) return;
    try {
      const encodedAuctionData = AuctionApi.encodeOpenAuctionFor(
        assetAddress,
        tokenId,
        acceptedToken,
        minimumBid,
        duration,
        signer,
        network,
      );

      if (profile.isOwnerKeyManager) {
        const encodedExecuteData = LSP3ProfileApi.encodeExecute(
          profile.address,
          auctionContracts[network],
          encodedAuctionData,
          signer,
        );

        await KeyManagerApi.executeTransactionViaKeyManager(
          profile.owner,
          encodedExecuteData,
          signer,
        );

        setAuctioningState(STATUS.SUCCESSFUL);

        return;
      }
      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        profile.address,
        auctionContracts[network],
        encodedAuctionData,
        signer,
      );

      setAuctioningState(STATUS.SUCCESSFUL);
    } catch (error) {
      setAuctioningState(STATUS.FAILED);
    }
  };

  return {
    auctioningState,
    setForAuction,
  };
};
