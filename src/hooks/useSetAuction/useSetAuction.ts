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
import { convertPrice, STATUS } from '../../utility';
import { IProfile } from '../../services/models';
import { Signer } from 'ethers';

export const useSetAuction = () => {
  const [auctioningState, setAuctioningState] = useState<STATUS>(STATUS.IDLE);
  const { data: signer } = useSigner();

  const setForAuction = async (
    profile: IProfile,
    assetAddress: Address,
    tokenId: number,
    duration: number,
    minimumBid: number,
    acceptedToken: Address,
    acceptedTokenDecimals: number,
    network: NetworkName,
  ) => {
    if (!signer) return;
    setAuctioningState(STATUS.LOADING);
    try {
      const encodedAuctionData = AuctionApi.encodeOpenAuctionFor(
        assetAddress,
        tokenId,
        acceptedToken,
        convertPrice(minimumBid, acceptedTokenDecimals),
        duration,
        signer as Signer,
        network,
      );

      if (profile.isOwnerKeyManager) {
        const encodedExecuteData = LSP3ProfileApi.encodeExecute(
          profile.address,
          auctionContracts[network],
          encodedAuctionData,
          signer as Signer,
        );

        await KeyManagerApi.executeTransactionViaKeyManager(
          profile.owner,
          encodedExecuteData,
          signer as Signer,
        );

        setAuctioningState(STATUS.SUCCESSFUL);

        return;
      }
      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        profile.address,
        auctionContracts[network],
        encodedAuctionData,
        signer as Signer,
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
