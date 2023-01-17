import { useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import {
  AuctionApi,
  auctionContracts,
} from '../../services/controllers/Auction';
import { ERC20Api } from '../../services/controllers/ERC20';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IClaimableAuctionToken, IProfile } from '../../services/models';
import { STATUS } from '../../utility';
import { getWhiteListedTokenAddresses } from '../../utility/content/addresses';
import { Address } from '../../utils/types';

export const useClaimAuctionTokens = (
  accountAddress: Address,
  profile: IProfile,
  network: NetworkName,
) => {
  const [{ data: signer }] = useSigner();
  const [claimableTokens, setClaimableTokens] = useState<
    IClaimableAuctionToken[] | null
  >(null);
  const [state, setState] = useState<STATUS>(STATUS.IDLE);
  const whiteListedtokensAddresses = getWhiteListedTokenAddresses(network);

  const getClaimableAmount = async () => {
    try {
      const res = await Promise.all(
        whiteListedtokensAddresses.map(async (tokenAddress) => {
          const [claimableTokensAmount, tokenInfo] = await Promise.all([
            AuctionApi.fetchClaimableAmountsFor(
              accountAddress,
              tokenAddress,
              network,
            ),
            ERC20Api.fetchErc20TokenInfo(tokenAddress, network),
          ]);

          return {
            tokenAddress,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            amount: claimableTokensAmount.amount,
          };
        }),
      );

      setClaimableTokens(res);
    } catch (error) {}
  };

  const claimTokens = async (tokenAddress: Address) => {
    if (!signer) return;

    setState(STATUS.LOADING);

    try {
      const encodedAuctionData = AuctionApi.encodeClaimToken(
        profile.address,
        tokenAddress,
        network,
        signer,
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

        setState(STATUS.SUCCESSFUL);

        return;
      }
      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        profile.address,
        auctionContracts[network],
        encodedAuctionData,
        signer,
      );

      setState(STATUS.SUCCESSFUL);
    } catch (error) {
      setState(STATUS.FAILED);
    }
  };

  useEffect(() => {
    getClaimableAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAddress]);

  return {
    claimableTokens,
    claimTokens,
    state,
    resetState: () => setState(STATUS.IDLE),
  };
};
