import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppDispatch } from '../../../boot/store';
import { NetworkName, RootState } from '../../../boot/types';
import {
  fetchAllMarkets,
  fetchCard,
  selectCardById,
} from '../../../features/cards';
import {
  fetchOwnerAddressOfTokenId,
  fetchOwnerOfTokenId,
  selectUserById,
} from '../../../features/profiles';
import { useModal } from '../../../hooks/useModal';
import { useRemoveMarketForLsp8Token } from '../../../hooks/useRemoveMarketForLsp8Token';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { IPermissionSet, IProfile } from '../../../services/models';
import { displayPrice, STATUS } from '../../../utility';
import { getAddressPermissionsOnUniversalProfile } from '../../../utility/permissions';
import { SellCardModal } from '../../AssetDetails/SellCardModal';
import {
  StyledActionsButtonWrapper,
  StyledCardPriceValue,
  StyledCardPriceValueWrapper,
  StyledChangePriceButton,
  StyledSetPriceButton,
  StyledWithdrawButton,
} from '../../AssetDetails/styles';
import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import { StyledMessageLabel } from '../EmbedMarket/styles';
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
  const defaultPermissions = {
    sign: '0',
    transfervalue: '0',
    deploy: '0',
    delegatecall: '0',
    staticcall: '0',
    call: '0',
    setdata: '0',
    addpermissions: '0',
    changepermissions: '0',
    changeowner: '0',
  };

  const [currentUsersPermissionsSet, setCurrentUsersPermissionsSet] =
    useState<IPermissionSet['permissions']>(defaultPermissions);

  const wasActiveProfile = useSelector((state: RootState) => state.userData.me);

  const activeProfile = useSelector(
    (state: RootState) =>
      wasActiveProfile &&
      selectUserById(state.userData[params.network], wasActiveProfile),
  );

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

  const isTokenId = useMemo(
    () =>
      activeProfile &&
      activeProfile.ownedAssets
        .find(
          (item) =>
            item.assetAddress.toLowerCase() === params.add.toLowerCase(),
        )
        ?.tokenIds.includes(Number(params.id)),
    [activeProfile, params.add, params.id],
  );

  const marketForTokenId = useMemo(
    () =>
      isTokenId && asset?.markets.find((item) => item.tokenId === params.id),
    [asset?.markets, isTokenId, params.id],
  );

  const token =
    marketForTokenId &&
    asset &&
    asset.whiteListedTokens.find(
      (i) => i.tokenAddress === marketForTokenId.acceptedToken,
    );

  const { transferCard, transferState } = useTransferLsp8Token(
    params.add,
    account ? account.address : '',
    Number(params.id),
    activeProfile ? activeProfile : ({} as IProfile),
    params.network,
  );

  const { removeMarket, removingMarket } = useRemoveMarketForLsp8Token(
    params.add,
    parseInt(params.id),
    activeProfile ? activeProfile : ({} as IProfile),
  );

  const {
    handlePresent: onPresentSellCardModal,
    onDismiss: onDismissSellCardModal,
  } = useModal(
    asset && activeProfile && (
      <SellCardModal
        ownerProfile={activeProfile}
        address={params.add}
        mint={Number(params.id)}
        price={marketForTokenId ? marketForTokenId.minimumAmount : undefined}
        marketTokenAddress={
          marketForTokenId ? marketForTokenId.acceptedToken : undefined
        }
        cardImg={asset.lsp8MetaData[params.id ? params.id : 0]?.image}
        onDismiss={() => onDismissSellCardModal()}
        whiteListedTokens={asset.whiteListedTokens}
        network={params.network}
      />
    ),
    'Sell Card Modal',
    'Sell Card',
  );

  useEffect(() => {
    if (!params.id || !params.add || !account) return;
    dispatch(
      fetchOwnerAddressOfTokenId({
        assetAddress: params.add,
        tokenId: params.id,
        network: params.network,
      }),
    );
  }, [account, dispatch, params.add, params.id, params.network]);

  useEffect(() => {
    if (!activeProfile || !account) {
      setCurrentUsersPermissionsSet(defaultPermissions);
      return;
    }
    const _currentUsersPermissionsSet = getAddressPermissionsOnUniversalProfile(
      activeProfile.permissionSet,
      account.address,
    );
    if (_currentUsersPermissionsSet !== undefined)
      setCurrentUsersPermissionsSet(_currentUsersPermissionsSet.permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, activeProfile]);

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

  useMemo(() => {
    if (!asset || marketsStatus !== STATUS.IDLE || !account) return;

    dispatch(
      fetchAllMarkets({ assetAddress: params.add, network: params.network }),
    );
  }, [account, asset, dispatch, marketsStatus, params.add, params.network]);

  useMemo(() => {
    if (activeProfile) return;

    wasActiveProfile &&
      dispatch(
        fetchOwnerOfTokenId({
          address: wasActiveProfile,
          network: params.network,
        }),
      );
  }, [activeProfile, dispatch, params, wasActiveProfile]);

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
          currentUsersPermissionsSet.call !== '1' &&
          account && (
            <StyledMessageLabel>
              EOA does not have rights to set price
            </StyledMessageLabel>
          )}
        {!account && (
          <StyledMessageLabel>metmask not connected</StyledMessageLabel>
        )}
        {!marketForTokenId && currentUsersPermissionsSet.call === '1' && (
          <>
            <StyledCardPriceValueWrapper>
              <StyledCardPriceValue>-</StyledCardPriceValue>
            </StyledCardPriceValueWrapper>
            <StyledActionsButtonWrapper>
              <StyledSetPriceButton onClick={onPresentSellCardModal}>
                Set price
              </StyledSetPriceButton>
              <StyledSetPriceButton onClick={transferCard}>
                {transferState === STATUS.LOADING
                  ? 'Transfering to metamask account…'
                  : 'Transfer to metamask account'}
              </StyledSetPriceButton>
            </StyledActionsButtonWrapper>
          </>
        )}
        {marketForTokenId && currentUsersPermissionsSet.call === '1' && (
          <>
            <StyledCardPriceValueWrapper>
              <StyledCardPriceValue>
                {marketForTokenId.minimumAmount &&
                  token &&
                  displayPrice(
                    marketForTokenId.minimumAmount,
                    token.decimals,
                  ).toString()}{' '}
                {token && token.symbol}
              </StyledCardPriceValue>
            </StyledCardPriceValueWrapper>
            <StyledActionsButtonWrapper>
              <StyledChangePriceButton onClick={onPresentSellCardModal}>
                Change price
              </StyledChangePriceButton>
              <StyledWithdrawButton onClick={removeMarket}>
                {removingMarket
                  ? 'Withdrawing from sale…'
                  : 'Withdraw from sale'}
              </StyledWithdrawButton>
            </StyledActionsButtonWrapper>
            <StyledActionsButtonWrapper>
              <StyledSetPriceButton onClick={transferCard}>
                {transferState === STATUS.LOADING
                  ? 'Transfering to metamask account…'
                  : 'Transfer to metamask account'}
              </StyledSetPriceButton>
            </StyledActionsButtonWrapper>
          </>
        )}
      </StyledEmbedSetPriceWrapper>
    </StyledEmbedSetPriceContent>
  );
};
