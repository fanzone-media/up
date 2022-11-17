import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppDispatch } from '../../../boot/store';
import { NetworkName, RootState } from '../../../boot/types';
import { fetchCard, selectCardById } from '../../../features/cards';
import { fetchOwnerAddressOfTokenId } from '../../../features/profiles';
import { useActiveProfile } from '../../../hooks/useActiveProfile';
import { useCurrentUserPermissions } from '../../../hooks/useCurrentUserPermissions';
import { useFetchMarkets } from '../../../hooks/useFetchMarkets';
import { useMintMarket } from '../../../hooks/useMintMarket';
import { STATUS } from '../../../utility';
import { AssetActions } from '../../AssetDetails/AssetActions';

import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import { StyledColorSpan, StyledMessageLabel } from '../EmbedMarket/styles';
import {
  StyledEmbedSetPriceContent,
  StyledEmbedSetPriceWrapper,
} from './styles';

interface IPrams {
  add: string;
  network: NetworkName;
  id: string;
}

export const EmbedSetPrice = () => {
  const params = useParams<IPrams>();
  const dispatch = useAppDispatch();
  const [{ data: account }] = useAccount();

  const wasActiveProfile = useSelector((state: RootState) => state.userData.me);

  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[params.network], params.add),
  );

  const cardStatus = useSelector(
    (state: RootState) => state.cards[params.network].status.fetchCard,
  );
  const profileStatus = useSelector(
    (state: RootState) =>
      state.userData[params.network].status.fetchOwnerOfProfile,
  );
  const marketsStatus = useSelector(
    (state: RootState) => state.cards[params.network].status.fetchMarket,
  );
  const tokenIdOwnerStatus = useSelector(
    (state: RootState) =>
      state.userData[params.network].status.fetchOwnerOfTokenId,
  );

  const currentUsersPermissions = useCurrentUserPermissions(wasActiveProfile);

  const { activeProfile } = useActiveProfile();

  useFetchMarkets(asset);

  const currentMintMarket = useMintMarket(params.add, params.id);

  useEffect(() => {
    if (
      !params.id ||
      !params.add ||
      !account ||
      tokenIdOwnerStatus !== STATUS.IDLE
    )
      return;
    dispatch(
      fetchOwnerAddressOfTokenId({
        assetAddress: params.add,
        tokenId: params.id,
        network: params.network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, params.add, params.id, params.network]);

  useEffect(() => {
    if (asset || cardStatus !== STATUS.IDLE || !account) return;
    dispatch(
      fetchCard({
        address: params.add,
        network: params.network,
        tokenId: params.id,
      }),
    );
  }, [
    account,
    asset,
    cardStatus,
    dispatch,
    params.add,
    params.id,
    params.network,
  ]);

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
