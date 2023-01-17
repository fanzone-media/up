import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { useAppDispatch } from '../../../boot/store';
import { RootState } from '../../../boot/types';
import { fetchOwnerAddressOfTokenId } from '../../../features/profiles';
import { useModal } from '../../../hooks';
import { useActiveProfile } from '../../../hooks/useActiveProfile';
import { useCurrentUserPermissions } from '../../../hooks/useCurrentUserPermissions';
import { useFetchAsset } from '../../../hooks/useFetchAsset';
import { useFetchMarkets } from '../../../hooks/useFetchMarkets';
import { useMintMarket } from '../../../hooks/useMintMarket';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { STATUS } from '../../../utility';
import { AssetActions } from '../../AssetDetails/AssetActions';
import { ClaimAuctionTokens } from '../../ProfileDetails/ClaimAuctionTokens';
import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import { StyledColorSpan, StyledMessageLabel } from '../EmbedMarket/styles';
import {
  StyledClaimAuctionTokensButton,
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

  const profileStatus = useSelector(
    (state: RootState) => state.userData[network].status.fetchOwnerOfProfile,
  );

  const tokenIdOwnerStatus = useSelector(
    (state: RootState) => state.userData[network].status.fetchOwnerOfTokenId,
  );

  const currentUsersPermissions = useCurrentUserPermissions(wasActiveProfile);

  const { activeProfile } = useActiveProfile();

  const { asset, status: assetStatus } = useFetchAsset(address);

  const { status: marketStatus } = useFetchMarkets(address);

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

  const {
    handlePresent: onPresentClaimAuctionTokensModal,
    onDismiss: onDismissClaimAuctionTokensModal,
  } = useModal(
    activeProfile && (
      <ClaimAuctionTokens
        profile={activeProfile}
        network={network}
        onDismiss={() => onDismissClaimAuctionTokensModal()}
      />
    ),
    'Claim Auction Tokens Modal',
    'Claim Tokens',
  );

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
        {(assetStatus === STATUS.LOADING ||
          marketStatus === STATUS.LOADING ||
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
        {currentUsersPermissions.call === '1' && (
          <StyledClaimAuctionTokensButton
            onClick={onPresentClaimAuctionTokensModal}
          >
            Claim Auction Tokens
          </StyledClaimAuctionTokensButton>
        )}
      </StyledEmbedSetPriceWrapper>
    </StyledEmbedSetPriceContent>
  );
};
