import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  BackwardsIcon,
  CategoryPropertyIcon,
  EditionPropertyIcon,
  ForwardsIcon,
  OptionIcon,
  ReloadIcon,
  SeasonPropertyIcon,
  SetPropertyIcon,
  ShareIcon,
  SubzonePropertyIcon,
  TeamPropertyIcon,
  TierPropertyIcon,
  ZonePropertyIcon,
  TransferIcon,
} from '../../assets';
import { useSelector } from 'react-redux';
import { NetworkName, RootState } from '../../boot/types';
import {
  clearState,
  fetchAllMarkets,
  fetchCard,
  fetchMetaDataForTokenId,
  selectCardById,
} from '../../features/cards';
import { useEffect } from 'react';
import {
  fetchAssetCreator,
  fetchOwnerAddressOfTokenId,
  fetchOwnerOfTokenId,
  fetchProfileByAddress,
  selectAllUsersItems,
  selectUserById,
  selectUserIds,
} from '../../features/profiles';
import { useMemo } from 'react';
import {
  StyledAssetDetailContent,
  StyledCardError,
  StyledLoader,
  StyledLoadingHolder,
  StyledAssetDetailsContentWrapper,
  StyledCardInfoWrapper,
  StyledCardPriceWrapper,
  StyledCardInfo,
  StyledCardMainDetails,
  StyledMedia,
  StyledMediaWrapper,
  StyledCardPriceWrapperHeader,
  StyledCardPriceLabel,
  StyledQuickActions,
  StyledReloadPriceAction,
  StyledActionIcon,
  StyledCardPriceValue,
  StyledCardPriceValueWrapper,
  StyledActionsButtonWrapper,
  StyledBuyButton,
  StyledCardInfoContainer,
  StyledCardInfoLabel,
  StyledCardInfoValue,
  StyledCardInfoAccordion,
  StyledCardPropertiesAccordion,
  StyledCardProperties,
  StyledCardPropertyIconWrapper,
  StyledCardPropertyContainer,
  StyledCardPropertyIcon,
  StyledCardProperty,
  StyledCardPropertyLabel,
  StyledCardPropertyValue,
  StyledHoldersAccordion,
  StyledMarketAccordion,
  StyledMintControls,
  StyledMintSkipButton,
  StyledMintSkipButtonImg,
  StyledExplorerIcon,
  StyledMintSliderIndex,
  StyledChangePriceButton,
  StyledWithdrawButton,
  StyledSetPriceButton,
  StyledTabContent,
  StyledNoProfileLabel,
} from './styles';
import { useAppDispatch } from '../../boot/store';
import { displayPrice, getChainExplorer, STATUS } from '../../utility';
import { BuyCardModal } from './BuyCardModal';
import { SellCardModal } from './SellCardModal';
import { TabedAccordion } from '../../components/TabedAccordion';
import { StyledAccordionTitle } from '../../components/Accordion/styles';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import ReactTooltip from 'react-tooltip';
import { IPermissionSet, IProfile } from '../../services/models';
// import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
// import { useSigner } from 'wagmi';
import { HolderPagination } from './HoldersPagination';
import { getAddressPermissionsOnUniversalProfile } from '../../utility/permissions';
import { useAccount } from 'wagmi';
import { DesktopCreatorsAccordion } from './DesktopCreatorsAccordion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { theme } from '../../boot/styles';
import { CardMarket } from './CardMarket';
import { useTransferLsp8Token } from '../../hooks/useTransferLsp8Token';
import { useRemoveMarketForLsp8Token } from '../../hooks/useRemoveMarketForLsp8Token';
import { useModal } from '../../hooks/useModal';
import { TransferCardTokenIdModal } from './TransferCardTokenIdModal';

interface IPrams {
  add: string;
  network: NetworkName;
  id: string;
}

const AssetDetails: React.FC = () => {
  const [currentUsersPermissionsSet, setCurrentUsersPermissionsSet] = useState<
    IPermissionSet['permissions']
  >({
    sign: '0',
    transferValue: '0',
    deploy: '0',
    delegateCall: '0',
    staticCall: '0',
    call: '0',
    setData: '0',
    addPermissions: '0',
    changePermissions: '0',
    changeOwner: '0',
  });
  const params = useParams<IPrams>();

  const history = useHistory();

  const explorer = getChainExplorer(params.network);

  const isDesktop = useMediaQuery(theme.screen.md);

  const wasActiveProfile = useSelector((state: RootState) => state.userData.me);

  const activeProfile = useSelector(
    (state: RootState) =>
      wasActiveProfile &&
      selectUserById(state.userData[params.network], wasActiveProfile),
  );

  const allProfiles = useSelector((state: RootState) =>
    selectUserIds(state.userData[params.network]),
  );

  const asset = useSelector((state: RootState) =>
    selectCardById(state, params.add),
  );

  const owner = useSelector((state: RootState) =>
    selectUserById(
      state.userData[params.network],
      asset?.owner ? asset.owner : '',
    ),
  );

  const [{ data: account }] = useAccount();

  const ownerStatus = useSelector(
    (state: RootState) => state.userData[params.network].status,
  );

  const creators = useSelector((state: RootState) =>
    selectAllUsersItems(state.userData[params.network]),
  )?.filter((item) => {
    return asset?.creators.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const cardError = useSelector((state: RootState) => state.cards.error);

  const cardStatus = useSelector((state: RootState) => state.cards.status);

  const marketsStatus = useSelector(
    (state: RootState) => state.cards.marketsStatus,
  );

  const metaDataStatus = useSelector(
    (state: RootState) => state.cards.metaDataStatus,
  );

  const creatorsStatus = useSelector(
    (state: RootState) => state.userData[params.network].creatorStatus,
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedMarketTokenId, setSelectedMarketTokenId] = useState<
    number | null
  >(null);

  const ownedTokenIds = useMemo(
    () =>
      activeProfile &&
      activeProfile.ownedAssets.find(
        (item) => item.assetAddress.toLowerCase() === params.add.toLowerCase(),
      )?.tokenIds,
    [activeProfile, params.add],
  );

  const marketsForOwnedTokens = useMemo(
    () =>
      ownedTokenIds &&
      asset?.markets.filter((item) => {
        return ownedTokenIds.some((i) => {
          return i === Number(item.tokenId);
        });
      }),
    [asset?.markets, ownedTokenIds],
  );

  const currentMintMarket = useMemo(() => {
    const market =
      marketsForOwnedTokens &&
      ownedTokenIds &&
      marketsForOwnedTokens.find(
        (item) => Number(item.tokenId) === ownedTokenIds[currentIndex],
      );
    const token =
      market &&
      asset &&
      asset.whiteListedTokens.find(
        (i) => i.tokenAddress === market.acceptedToken,
      );
    return (
      market && {
        ...market,
        decimals: token && token.decimals,
        symbol: token && token.symbol,
      }
    );
  }, [asset, currentIndex, marketsForOwnedTokens, ownedTokenIds]);

  const selectedMintMarket = useMemo(() => {
    const market = asset?.markets.find(
      (item) => Number(item.tokenId) === selectedMarketTokenId,
    );
    const token =
      market &&
      asset &&
      asset.whiteListedTokens.find(
        (i) => i.tokenAddress === market.acceptedToken,
      );
    return (
      market && {
        ...market,
        decimals: token && token.decimals,
        symbol: token && token.symbol,
      }
    );
  }, [asset, selectedMarketTokenId]);

  const dispatch = useAppDispatch();

  const { transferCard, transfering } = useTransferLsp8Token(
    params.add,
    account ? account.address : '',
    ownedTokenIds ? ownedTokenIds[currentIndex] : 0,
    activeProfile ? activeProfile : ({} as IProfile),
  );

  const { removeMarket, removingMarket } = useRemoveMarketForLsp8Token(
    params.add,
    parseInt(params.id),
    activeProfile ? activeProfile : ({} as IProfile),
  );

  const {
    handlePresent: onPresentBuyCardModal,
    onDismiss: onDismissBuyCardModal,
  } = useModal(
    asset && selectedMintMarket && (
      <BuyCardModal
        address={params.add}
        mint={Number(selectedMintMarket.tokenId)}
        price={selectedMintMarket.minimumAmount}
        tokenAddress={selectedMintMarket.acceptedToken}
        whiteListedTokens={asset.whiteListedTokens}
        cardImg={asset.ls8MetaData[params.id ? params.id : 0]?.image}
        onClose={() => {
          setSelectedMarketTokenId(null);
          onDismissBuyCardModal();
        }}
        network={params.network}
      />
    ),
    'Buy Card Modal',
    'Buy Card',
  );

  const {
    handlePresent: onPresentSellCardModal,
    onDismiss: onDismissSellCardModal,
  } = useModal(
    asset && ownedTokenIds && activeProfile && (
      <SellCardModal
        ownerProfile={activeProfile}
        address={params.add}
        mint={ownedTokenIds[currentIndex]}
        price={currentMintMarket ? currentMintMarket.minimumAmount : undefined}
        marketTokenAddress={
          currentMintMarket ? currentMintMarket.acceptedToken : undefined
        }
        cardImg={asset.ls8MetaData[params.id ? params.id : 0]?.image}
        onClose={() => onDismissSellCardModal()}
        whiteListedTokens={asset.whiteListedTokens}
        network={params.network}
      />
    ),
    'Sell Card Modal',
    'Sell Card',
  );

  const {
    handlePresent: onPresentTransferCardModal,
    onDismiss: onDismissTransferCardModal,
  } = useModal(
    <>
      {activeProfile && (
        <TransferCardTokenIdModal
          cardAddress={params.add}
          tokenId={parseInt(params.id)}
          profile={activeProfile}
          onDismiss={() => onDismissTransferCardModal()}
        />
      )}
    </>,
    'Card Transfer Modal',
    'Transfer Card',
  );

  useMemo(() => {
    if (!asset || owner || ownerStatus !== STATUS.IDLE) return;

    dispatch(
      fetchProfileByAddress({
        address: asset.owner,
        network: params.network,
      }),
    );
  }, [asset, dispatch, owner, ownerStatus, params.network]);

  useMemo(() => {
    if (activeProfile) return;

    wasActiveProfile &&
      dispatch(
        fetchOwnerOfTokenId({
          address: wasActiveProfile,
          network: params.network,
        }),
      );
  }, [activeProfile, dispatch, params.network, wasActiveProfile]);

  //getAllMarkets
  useMemo(() => {
    if (!asset || marketsStatus !== STATUS.IDLE) return;

    dispatch(
      fetchAllMarkets({ assetAddress: params.add, network: params.network }),
    );
  }, [asset, dispatch, marketsStatus, params.add, params.network]);

  useMemo(() => {
    if (!params.id || !ownedTokenIds) return;
    setCurrentIndex(ownedTokenIds.indexOf(Number(params.id)));
  }, [ownedTokenIds, params.id]);

  useMemo(() => {
    if (!params.id && ownedTokenIds) {
      history.push(
        `/${params.network}/asset/${params.add}/${ownedTokenIds[currentIndex]}`,
      );
    }
  }, [
    currentIndex,
    history,
    ownedTokenIds,
    params.add,
    params.id,
    params.network,
  ]);

  useMemo(() => {
    if (
      wasActiveProfile &&
      ownedTokenIds &&
      ownedTokenIds.length > 0 &&
      asset &&
      !(`${ownedTokenIds[currentIndex].toString()}` in asset.ls8MetaData) &&
      metaDataStatus !== STATUS.LOADING
    ) {
      dispatch(
        fetchMetaDataForTokenId({
          assetAddress: params.add,
          network: params.network,
          tokenId: ownedTokenIds[currentIndex],
        }),
      );
    }
  }, [
    asset,
    currentIndex,
    dispatch,
    metaDataStatus,
    ownedTokenIds,
    params.add,
    params.network,
    wasActiveProfile,
  ]);

  useMemo(() => {
    if (!asset || creatorsStatus === STATUS.LOADING) return;
    let addresses: string[] = [];
    asset.creators.forEach((item) => {
      if (!allProfiles?.includes(item)) {
        addresses.push(item);
      }
    });
    if (addresses.length > 0) {
      dispatch(
        fetchAssetCreator({ address: addresses, network: params.network }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, allProfiles, dispatch, params.network]);

  useEffect(() => {
    dispatch(clearState());
  }, [dispatch, params]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (asset || cardStatus !== STATUS.IDLE) return;
    dispatch(
      fetchCard({
        address: params.add,
        network: params.network,
        tokenId: params.id,
      }),
    );
  }, [asset, cardStatus, dispatch, params.add, params.id, params.network]);

  useEffect(() => {
    if (!params.id || !params.add) return;
    dispatch(
      fetchOwnerAddressOfTokenId({
        assetAddress: params.add,
        tokenId: params.id,
        network: params.network,
      }),
    );
  }, [dispatch, params.add, params.id, params.network]);

  useEffect(() => {
    if (!activeProfile || !account) return;
    const _currentUsersPermissionsSet = getAddressPermissionsOnUniversalProfile(
      activeProfile.permissionSet,
      account.address,
    );
    if (_currentUsersPermissionsSet !== undefined)
      setCurrentUsersPermissionsSet(_currentUsersPermissionsSet.permissions);
  }, [owner, account, activeProfile]);

  const propertiesImages: { [key: string]: string } = useMemo(
    () => ({
      Tier: TierPropertyIcon,
      Edition: EditionPropertyIcon,
      'Edition Category': CategoryPropertyIcon,
      'Edition Set': SetPropertyIcon,
      Season: SeasonPropertyIcon,
      Zone: ZonePropertyIcon,
      League: SubzonePropertyIcon,
      Team: TeamPropertyIcon,
    }),
    [],
  );

  const cardProperties = useMemo(
    () => [
      {
        label: 'Tier',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.tier,
        icon: TierPropertyIcon,
      },
      {
        label: 'Edition',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.edition,
        icon: EditionPropertyIcon,
      },
      {
        label: 'Category',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.editionCategory,
        icon: CategoryPropertyIcon,
      },
      {
        label: 'Set',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.editionSet,
        icon: SetPropertyIcon,
      },
      {
        label: 'Season',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.season,
        icon: SeasonPropertyIcon,
      },
      {
        label: 'Zone',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.zoneLabel,
        icon: ZonePropertyIcon,
      },
      {
        label: 'League',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.leagueLabel,
        icon: SubzonePropertyIcon,
      },
      {
        label: 'Team',
        value:
          asset?.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
            ?.teamLabel,
        icon: TeamPropertyIcon,
      },
    ],
    [asset, currentIndex, ownedTokenIds],
  );

  const cardInfo: {
    label: string;
    value: string;
    valueType?: string;
  }[] = [
    {
      label: 'Contract Address',
      value: asset ? asset.address : '',
      valueType: 'address',
    },
    {
      label: 'Mint',
      value: ownedTokenIds ? ownedTokenIds[currentIndex].toString() : '',
    },
    {
      label: 'Total amount of Tokens',
      value: asset ? asset.totalSupply.toString() : '',
    },
    { label: 'Token Standard', value: 'LSP8' },
    { label: 'Network', value: asset ? asset.network : '' },
    { label: 'Score', value: '' },
    {
      label: 'Current owner',
      value: wasActiveProfile ? wasActiveProfile : '',
      valueType: 'address',
    },
  ];

  const nextMint = () => {
    const nextIndex = currentIndex + 1;
    if (!ownedTokenIds || nextIndex >= ownedTokenIds.length) return;
    history.push(
      `/${params.network}/asset/${params.add}/${ownedTokenIds[nextIndex]}`,
    );
    setCurrentIndex(nextIndex);
  };

  const previousMint = () => {
    const previousIndex = currentIndex - 1;
    if (!ownedTokenIds || previousIndex < 0) return;
    history.push(
      `/${params.network}/asset/${params.add}/${ownedTokenIds[previousIndex]}`,
    );
    setCurrentIndex(previousIndex);
  };

  const renderIssuer = useMemo(() => {
    const findBalanceOf =
      owner &&
      owner.ownedAssets.find(
        (item) => item.assetAddress === params.add.toLowerCase(),
      );
    return (
      <StyledTabContent>
        {asset?.address === params.add && owner?.address === asset.owner && (
          <>
            <ProfileCard
              userProfile={owner}
              balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
              type="owner"
              tooltipId="ownerTooltip"
            />
            <ReactTooltip
              id="ownerTooltip"
              getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
            ></ReactTooltip>
          </>
        )}
        {!owner && (
          <StyledNoProfileLabel>Issuer not found</StyledNoProfileLabel>
        )}
      </StyledTabContent>
    );
  }, [asset?.address, asset?.owner, params.add, owner]);

  const renderCurrentMintOwner = useMemo(() => {
    const findBalanceOf =
      activeProfile &&
      activeProfile.ownedAssets.find(
        (item) => item.assetAddress === params.add.toLowerCase(),
      );
    return (
      <StyledTabContent>
        {activeProfile && (
          <>
            <ProfileCard
              userProfile={activeProfile}
              balance={findBalanceOf ? findBalanceOf.balance : 0}
              type="owner"
              tooltipId="ownerTooltip"
            />
            <ReactTooltip
              id="ownerTooltip"
              getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
            ></ReactTooltip>
          </>
        )}
        {!activeProfile && (
          <StyledNoProfileLabel>Owner not found</StyledNoProfileLabel>
        )}
      </StyledTabContent>
    );
  }, [activeProfile, params.add]);

  const renderCreators = useMemo(
    () => (
      <StyledTabContent>
        {creators?.map((creator: IProfile) => {
          const findBalanceOf = creator.ownedAssets.find(
            (item) => item.assetAddress === params.add.toLowerCase(),
          );
          return (
            <React.Fragment key={creator.address}>
              <ProfileCard
                userProfile={creator}
                balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
                type="creator"
                tooltipId="designerTooltip"
              />
              <ReactTooltip
                id="designerTooltip"
                getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
              ></ReactTooltip>
            </React.Fragment>
          );
        })}
        {creators.length === 0 && (
          <StyledNoProfileLabel>Creators not found</StyledNoProfileLabel>
        )}
      </StyledTabContent>
    ),
    [creators, params.add],
  );

  const renderHolderPagination = useMemo(() => {
    if (!asset) return;
    return <HolderPagination holdersAddresses={asset.holders} />;
  }, [asset]);

  const renderCardPrice = useMemo(() => {
    if (
      (!currentUsersPermissionsSet ||
        currentUsersPermissionsSet.call === '0') &&
      currentMintMarket
    ) {
      return (
        <>
          <StyledCardPriceValueWrapper>
            <StyledCardPriceValue>
              {currentMintMarket.minimumAmount &&
                currentMintMarket.decimals &&
                displayPrice(
                  currentMintMarket.minimumAmount,
                  currentMintMarket.decimals,
                ).toString()}{' '}
              {currentMintMarket.symbol}
            </StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledBuyButton
              onClick={() => {
                setSelectedMarketTokenId(Number(currentMintMarket.tokenId));
                onPresentBuyCardModal();
              }}
            >
              Buy now
            </StyledBuyButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }

    if (
      !currentMintMarket &&
      ownedTokenIds &&
      currentUsersPermissionsSet.call === '1'
    ) {
      return (
        <>
          <StyledCardPriceValueWrapper>
            <StyledCardPriceValue>-</StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledSetPriceButton onClick={onPresentSellCardModal}>
              Set price
            </StyledSetPriceButton>
            <StyledSetPriceButton onClick={transferCard}>
              {transfering
                ? 'Transfering to metamask account…'
                : 'Transfer to metamask account'}
            </StyledSetPriceButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }
    if (
      currentMintMarket &&
      ownedTokenIds &&
      currentUsersPermissionsSet.call === '1'
    ) {
      return (
        <>
          <StyledCardPriceValueWrapper>
            <StyledCardPriceValue>
              {currentMintMarket.minimumAmount &&
                currentMintMarket.decimals &&
                displayPrice(
                  currentMintMarket.minimumAmount,
                  currentMintMarket.decimals,
                ).toString()}{' '}
              {currentMintMarket.symbol}
            </StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledChangePriceButton onClick={onPresentSellCardModal}>
              Change price
            </StyledChangePriceButton>
            <StyledWithdrawButton onClick={removeMarket}>
              {removingMarket ? 'Withdrawing from sale…' : 'Withdraw from sale'}
            </StyledWithdrawButton>
          </StyledActionsButtonWrapper>
          <StyledActionsButtonWrapper>
            <StyledSetPriceButton onClick={transferCard}>
              {transfering
                ? 'Transfering to metamask account…'
                : 'Transfer to metamask account'}
            </StyledSetPriceButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }
  }, [
    currentMintMarket,
    currentUsersPermissionsSet,
    onPresentBuyCardModal,
    onPresentSellCardModal,
    ownedTokenIds,
    transferCard,
    transfering,
    removeMarket,
    removingMarket,
  ]);

  const renderCardProperties = useMemo(() => {
    if (
      asset &&
      asset.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
        ?.attributes &&
      asset.ls8MetaData[ownedTokenIds ? ownedTokenIds[currentIndex] : 0]
        .attributes.length > 0
    ) {
      return asset?.ls8MetaData[
        ownedTokenIds ? ownedTokenIds[currentIndex] : 0
      ].attributes.map((item) => {
        if ('trait_type' in item) {
          return (
            <StyledCardPropertyContainer key={item.trait_type}>
              <StyledCardPropertyIconWrapper>
                <StyledCardPropertyIcon
                  src={propertiesImages[item.trait_type]}
                  alt=""
                />
              </StyledCardPropertyIconWrapper>
              <StyledCardProperty>
                <StyledCardPropertyLabel>
                  {item.trait_type}
                </StyledCardPropertyLabel>
                <StyledCardPropertyValue>{item.value}</StyledCardPropertyValue>
              </StyledCardProperty>
            </StyledCardPropertyContainer>
          );
        }
        return null;
      });
    } else {
      return cardProperties.map((item) => (
        <StyledCardPropertyContainer key={item.label}>
          <StyledCardPropertyIconWrapper>
            <StyledCardPropertyIcon src={item.icon} alt="" />
          </StyledCardPropertyIconWrapper>
          <StyledCardProperty>
            <StyledCardPropertyLabel>{item.label}</StyledCardPropertyLabel>
            <StyledCardPropertyValue>{item.value}</StyledCardPropertyValue>
          </StyledCardProperty>
        </StyledCardPropertyContainer>
      ));
    }
  }, [asset, cardProperties, currentIndex, ownedTokenIds, propertiesImages]);

  return (
    <StyledAssetDetailsContentWrapper>
      {cardStatus === 'loading' ? (
        <StyledLoadingHolder>
          <StyledLoader color="#ed7a2d" />
        </StyledLoadingHolder>
      ) : (
        <>
          {cardError && cardStatus === 'failed' ? (
            <>
              <StyledCardError>Asset not found</StyledCardError>
            </>
          ) : (
            <StyledAssetDetailContent>
              <StyledCardMainDetails>
                <StyledMediaWrapper>
                  {asset && (
                    <StyledMedia
                      src={
                        asset.ls8MetaData[
                          ownedTokenIds ? ownedTokenIds[currentIndex] : 0
                        ]?.image
                      }
                      alt=""
                    />
                  )}
                  <a
                    href={explorer && explorer.exploreUrl + asset?.address}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <StyledExplorerIcon src={explorer?.icon} alt="" />
                  </a>
                  {wasActiveProfile && ownedTokenIds && (
                    <StyledMintControls>
                      <StyledMintSkipButton onClick={previousMint}>
                        <StyledMintSkipButtonImg src={BackwardsIcon} alt="" />
                      </StyledMintSkipButton>
                      <StyledMintSliderIndex>
                        {currentIndex + 1}/{ownedTokenIds?.length}
                      </StyledMintSliderIndex>
                      <StyledMintSkipButton onClick={nextMint}>
                        <StyledMintSkipButtonImg src={ForwardsIcon} alt="" />
                      </StyledMintSkipButton>
                    </StyledMintControls>
                  )}
                </StyledMediaWrapper>
                <StyledCardInfoWrapper>
                  <StyledCardPriceWrapper>
                    <StyledCardPriceWrapperHeader>
                      <StyledCardPriceLabel>Current Price</StyledCardPriceLabel>
                      <StyledQuickActions>
                        {ownedTokenIds &&
                          currentUsersPermissionsSet.call === '1' && (
                            <StyledReloadPriceAction>
                              <StyledActionIcon
                                src={TransferIcon}
                                alt="transfer"
                                title="transfer"
                                onClick={onPresentTransferCardModal}
                              />
                            </StyledReloadPriceAction>
                          )}
                        <StyledReloadPriceAction>
                          <StyledActionIcon
                            src={ReloadIcon}
                            alt="reload"
                            title="reload"
                          />
                        </StyledReloadPriceAction>
                        <StyledReloadPriceAction>
                          <StyledActionIcon
                            src={ShareIcon}
                            alt="share"
                            title="share"
                          />
                        </StyledReloadPriceAction>
                        <StyledReloadPriceAction>
                          <StyledActionIcon
                            src={OptionIcon}
                            alt="options"
                            title="options"
                          />
                        </StyledReloadPriceAction>
                      </StyledQuickActions>
                    </StyledCardPriceWrapperHeader>
                    {renderCardPrice}
                  </StyledCardPriceWrapper>
                  <StyledCardInfoAccordion
                    header={
                      <StyledAccordionTitle>Card Info</StyledAccordionTitle>
                    }
                    enableToggle
                  >
                    <StyledCardInfo>
                      {cardInfo.map((item) => (
                        <StyledCardInfoContainer key={item.label}>
                          <StyledCardInfoLabel>
                            {item.label}
                          </StyledCardInfoLabel>
                          <StyledCardInfoValue>
                            {item.valueType === 'address'
                              ? `${item.value.slice(0, 8)}...${item.value.slice(
                                  item.value.length - 4,
                                  item.value.length,
                                )}`
                              : item.value}
                          </StyledCardInfoValue>
                        </StyledCardInfoContainer>
                      ))}
                    </StyledCardInfo>
                  </StyledCardInfoAccordion>
                </StyledCardInfoWrapper>
              </StyledCardMainDetails>
              {!isDesktop ? (
                <TabedAccordion
                  tabs={[
                    { name: 'Creators', content: renderCreators },
                    { name: 'Owner', content: renderCurrentMintOwner },
                    { name: 'Issuer', content: renderIssuer },
                  ]}
                />
              ) : (
                <DesktopCreatorsAccordion
                  creatorsContent={renderCreators}
                  ownerContent={activeProfile && renderCurrentMintOwner}
                  issuerContent={renderIssuer}
                  enableToggle
                />
              )}
              <StyledCardPropertiesAccordion
                header={<StyledAccordionTitle>Details</StyledAccordionTitle>}
                enableToggle
              >
                <StyledCardProperties>
                  {renderCardProperties}
                </StyledCardProperties>
              </StyledCardPropertiesAccordion>
              <StyledMarketAccordion
                header={<StyledAccordionTitle>Market</StyledAccordionTitle>}
                enableToggle
              >
                <CardMarket
                  asset={asset}
                  cardMarkets={asset?.markets}
                  whiteListedTokens={asset?.whiteListedTokens}
                  onBuyClick={(tokenId: number) => {
                    onPresentBuyCardModal();
                    setSelectedMarketTokenId(tokenId);
                  }}
                />
              </StyledMarketAccordion>
              <StyledHoldersAccordion
                header={
                  <StyledAccordionTitle>Other Holders</StyledAccordionTitle>
                }
                enableToggle
              >
                {renderHolderPagination}
              </StyledHoldersAccordion>
            </StyledAssetDetailContent>
          )}
        </>
      )}
    </StyledAssetDetailsContentWrapper>
  );
};

export default AssetDetails;
