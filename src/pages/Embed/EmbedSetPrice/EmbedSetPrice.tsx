import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { useAppDispatch } from '../../../boot/store';
import { RootState } from '../../../boot/types';
import { fetchCard, selectCardById } from '../../../features/cards';
import { fetchOwnerAddressOfTokenId } from '../../../features/profiles';
import { useActiveProfile } from '../../../hooks/useActiveProfile';
import { useCurrentUserPermissions } from '../../../hooks/useCurrentUserPermissions';
import { useFetchMarkets } from '../../../hooks/useFetchMarkets';
import { useMintMarket } from '../../../hooks/useMintMarket';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { STATUS } from '../../../utility';
import { AssetActions } from '../../AssetDetails/AssetActions';

import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import { StyledColorSpan, StyledMessageLabel } from '../EmbedMarket/styles';
import {
  StyledEmbedSetPriceContent,
  StyledEmbedSetPriceWrapper,
} from './styles';

export const EmbedSetPrice = () => {
  const { address, network, tokenId } = useUrlParams();
  const dispatch = useAppDispatch();
  const [{ data: account }] = useAccount();

  const wasActiveProfile = useSelector(
    (state: RootState) => tokenId && state.userData.me,
  );

  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], address),
  );

  const cardStatus = useSelector(
    (state: RootState) => state.cards[network].status.fetchCard,
  );
  const profileStatus = useSelector(
    (state: RootState) => state.userData[network].status.fetchOwnerOfProfile,
  );
  const marketsStatus = useSelector(
    (state: RootState) => state.cards[network].status.fetchMarket,
  );
  const tokenIdOwnerStatus = useSelector(
    (state: RootState) => state.userData[network].status.fetchOwnerOfTokenId,
  );

  const currentUsersPermissions = useCurrentUserPermissions(wasActiveProfile);

  const { activeProfile } = useActiveProfile();

  useFetchMarkets(asset);

  const currentMintMarket = useMintMarket(address, tokenId);

  useEffect(() => {
    if (!tokenId || !address || !account || tokenIdOwnerStatus !== STATUS.IDLE)
      return;
    dispatch(
      fetchOwnerAddressOfTokenId({
        assetAddress: address,
        tokenId,
        network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, address, tokenId, network]);

  useEffect(() => {
    if (asset || cardStatus !== STATUS.IDLE || !account) return;
    dispatch(
      fetchCard({
        address,
        network,
        tokenId,
      }),
    );
  }, [account, address, asset, cardStatus, dispatch, network, tokenId]);

  const renderCardPrice = useMemo(
    () => (
      <AssetActions
        asset={asset ? asset : null}
        activeProfile={activeProfile}
        currentUsersPermissions={currentUsersPermissions}
        marketForTokenId={currentMintMarket}
      />
    ),
    [activeProfile, asset, currentMintMarket, currentUsersPermissions],
  );

  return (
    <StyledEmbedSetPriceContent>
      <ConnectToMetaMaskButton />
      <StyledEmbedSetPriceWrapper>
        {(cardStatus === STATUS.LOADING ||
          marketsStatus === STATUS.LOADING ||
          profileStatus === STATUS.LOADING) && (
          <StyledMessageLabel>loading . . .</StyledMessageLabel>
        )}
        {asset &&
          activeProfile &&
          currentUsersPermissions.call !== '1' &&
          account && (
            <StyledMessageLabel>
              EOA does not have rights to set price
            </StyledMessageLabel>
          )}
        {!account && (
          <StyledMessageLabel>
            Metamask account not connected yet,{' '}
            <StyledColorSpan>click on the button above</StyledColorSpan> to
            procede.
          </StyledMessageLabel>
        )}
        {renderCardPrice}
      </StyledEmbedSetPriceWrapper>
    </StyledEmbedSetPriceContent>
  );
};
