import { Signer } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import {
  AuctionApi,
  auctionContracts,
} from '../../services/controllers/Auction';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IProfile } from '../../services/models';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';

export const useRemoveAuction = (
  profile: IProfile,
  assetAddress: Address,
  tokenId: number,
  network: NetworkName,
) => {
  const [removeAuctionState, setRemoveAuctionState] = useState<STATUS>(
    STATUS.IDLE,
  );
  const { data: signer } = useSigner();

  const removeAuction = async () => {
    setRemoveAuctionState(STATUS.LOADING);
    if (!signer) return;

    try {
      const encodedRemoveAuctionData = AuctionApi.encodeCancelAuctionFor(
        assetAddress,
        tokenId,
        signer as Signer,
        network,
      );

      if (profile.isOwnerKeyManager) {
        const encodedExecuteData = LSP3ProfileApi.encodeExecute(
          profile.address,
          auctionContracts[network],
          encodedRemoveAuctionData,
          signer as Signer,
        );

        await KeyManagerApi.executeTransactionViaKeyManager(
          profile.owner,
          encodedExecuteData,
          signer as Signer,
        );

        setRemoveAuctionState(STATUS.SUCCESSFUL);

        return;
      }

      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        profile.address,
        auctionContracts[network],
        encodedRemoveAuctionData,
        signer as Signer,
      );

      setRemoveAuctionState(STATUS.SUCCESSFUL);
    } catch (error) {
      setRemoveAuctionState(STATUS.FAILED);
    }
  };

  return { removeAuction, removeAuctionState };
};
