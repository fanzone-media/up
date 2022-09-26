import React, { useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
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
  StyledCardPriceWrapper,
  StyledCardPriceWrapperHeader,
  StyledCardPriceLabel,
  StyledQuickActions,
  StyledReloadPriceAction,
  StyledActionIcon,
  StyledCardPriceValue,
  StyledCardPriceValueWrapper,
  StyledActionsButtonWrapper,
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
  StyledMintSliderIndex,
  StyledChangePriceButton,
  StyledWithdrawButton,
  StyledSetPriceButton,
  StyledTabContent,
  StyledNoProfileLabel,
  StyledMintSliderInput,
  StyledSelectMintModalButton,
  StyledMediaContainer,
  StyledHeroImg,
  StyledAssetDetailContainer,
  StyledContractDetailHeader,
  StyledContractName,
  StyledContractDescription,
  StyledOtherMediaContainer,
  StyledOtherImg,
  StyledHeroImgContainer,
  StyledVideo,
} from './styles';
import { useAppDispatch } from '../../boot/store';
import { displayPrice, STATUS } from '../../utility';
import { SellCardModal } from './SellCardModal';
import { TabedAccordion } from '../../components/TabedAccordion';
import { StyledAccordionTitle } from '../../components/Accordion/styles';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import ReactTooltip from 'react-tooltip';
import { IPermissionSet, IProfile } from '../../services/models';
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
import { SelectMintModalContent } from './SelectMintModalContent';
import { BuyCardButton } from './components/BuyCardButton';
import Utils from '../../services/utilities/util';
import { CardInfoAccordion } from './components/CardInfoAccordion';
import { ShareReferModal } from '../../components/ShareReferModal';
import { useQueryParams } from '../../hooks/useQueryParams';
import { isAddress } from 'ethers/lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

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
    transfervalue: '0',
    deploy: '0',
    delegatecall: '0',
    staticcall: '0',
    call: '0',
    setdata: '0',
    addpermissions: '0',
    changepermissions: '0',
    changeowner: '0',
  });
  const params = useParams<IPrams>();
  const history = useHistory();
  const { pathname } = useLocation();
  let query = useQueryParams();
  const { setReferrer } = useLocalStorage();
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
    selectCardById(state.cards[params.network], params.add),
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

  const cardError = useSelector(
    (state: RootState) => state.cards[params.network].error,
  );

  const cardStatus = useSelector(
    (state: RootState) => state.cards[params.network].status,
  );

  const marketsStatus = useSelector(
    (state: RootState) => state.cards[params.network].marketsStatus,
  );

  const metaDataStatus = useSelector(
    (state: RootState) => state.cards[params.network].metaDataStatus,
  );

  const creatorsStatus = useSelector(
    (state: RootState) => state.userData[params.network].creatorStatus,
  );

  const mintIdInputRef = useRef<HTMLInputElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const ownedTokenIds = useMemo(
    () =>
      activeProfile &&
      activeProfile.ownedAssets.find(
        (item) => item.assetAddress.toLowerCase() === params.add.toLowerCase(),
      )?.tokenIds,
    [activeProfile, params.add],
  );

  const currentTokenId = useMemo(() => {
    let index: string = '0';
    if (
      asset?.supportedInterface === 'erc721' &&
      metaDataStatus !== STATUS.FAILED
    ) {
      index = params.id ? params.id : '0';
    } else if (asset?.supportedInterface === 'lsp8') {
      index = ownedTokenIds ? ownedTokenIds[currentIndex].toString() : '0';
    }
    return index;
  }, [
    asset?.supportedInterface,
    currentIndex,
    metaDataStatus,
    ownedTokenIds,
    params.id,
  ]);

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
      marketsForOwnedTokens.find((item) => item.tokenId === currentTokenId);
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
  }, [asset, currentTokenId, marketsForOwnedTokens, ownedTokenIds]);

  const dispatch = useAppDispatch();

  const nextMint = () => {
    const nextIndex = currentIndex + 1;
    if (!ownedTokenIds || nextIndex >= ownedTokenIds.length) return;
    if (mintIdInputRef.current) {
      mintIdInputRef.current.value = (nextIndex + 1).toString();
    }
    history.push(
      `/${params.network}/asset/${params.add}/${ownedTokenIds[nextIndex]}`,
    );
    setCurrentIndex(nextIndex);
  };

  const previousMint = () => {
    const previousIndex = currentIndex - 1;
    if (!ownedTokenIds || previousIndex < 0) return;
    if (mintIdInputRef.current) {
      mintIdInputRef.current.value = (previousIndex + 1).toString();
    }
    history.push(
      `/${params.network}/asset/${params.add}/${ownedTokenIds[previousIndex]}`,
    );
    setCurrentIndex(previousIndex);
  };

  const mintChangeHelper = (mint: number) => {
    if (ownedTokenIds && mint > 0 && mint <= ownedTokenIds.length) {
      history.push(
        `/${params.network}/asset/${params.add}/${ownedTokenIds[mint - 1]}`,
      );
      setCurrentIndex(mint - 1);
    }
  };

  const onEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    mintChangeHelper(val);
  };

  const { transferCard, transferState } = useTransferLsp8Token(
    params.add,
    account ? account.address : '',
    Number(currentTokenId),
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
    asset && ownedTokenIds && activeProfile && (
      <SellCardModal
        ownerProfile={activeProfile}
        address={params.add}
        mint={Number(currentTokenId)}
        price={currentMintMarket ? currentMintMarket.minimumAmount : undefined}
        marketTokenAddress={
          currentMintMarket ? currentMintMarket.acceptedToken : undefined
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

  const {
    handlePresent: onPresentSelectMintModal,
    onDismiss: onDismissSelectMintModal,
  } = useModal(
    ownedTokenIds && asset && (
      <SelectMintModalContent
        ownedTokenIds={ownedTokenIds}
        markets={asset.markets}
        whiteListedTokens={asset.whiteListedTokens}
        onSelect={mintChangeHelper}
        onSelectCallback={() => onDismissSelectMintModal()}
      />
    ),
    'Select Mint Modal',
    'Select Mint',
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
          network={params.network}
        />
      )}
    </>,
    'Card Transfer Modal',
    'Transfer Card',
  );

  const { handlePresent: onPresentShareModal, onDismiss: onDismissShareModal } =
    useModal(
      <ShareReferModal
        network={params.network}
        pathName={pathname}
        onDismiss={() => onDismissShareModal()}
      />,
      'Card Share Modal',
      'Share Card',
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
    if (!params.id && ownedTokenIds && asset?.supportedInterface === 'lsp8') {
      history.push(
        `/${params.network}/asset/${params.add}/${ownedTokenIds[currentIndex]}`,
      );
    }
  }, [
    asset?.supportedInterface,
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
      ((ownedTokenIds && ownedTokenIds.length > 0) ||
        asset?.supportedInterface === 'erc721') &&
      asset &&
      !(params.id in asset.lsp8MetaData) &&
      metaDataStatus === STATUS.IDLE
    ) {
      dispatch(
        fetchMetaDataForTokenId({
          assetAddress: params.add,
          network: params.network,
          tokenId: params.id,
          supportedInterface: asset.supportedInterface,
        }),
      );
    }
  }, [
    asset,
    dispatch,
    metaDataStatus,
    ownedTokenIds,
    params.add,
    params.id,
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
    dispatch(clearState(params.network));
  }, [dispatch, params]);

  useEffect(() => {
    const referrerAddress = query.get('referrer');
    referrerAddress &&
      isAddress(referrerAddress) &&
      setReferrer(params.network, referrerAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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
            {asset && ownedTokenIds && (
              <BuyCardButton asset={asset} mint={Number(currentTokenId)} />
            )}
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
              {transferState === STATUS.LOADING
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
              {transferState === STATUS.LOADING
                ? 'Transfering to metamask account…'
                : 'Transfer to metamask account'}
            </StyledSetPriceButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }
  }, [
    currentUsersPermissionsSet,
    currentMintMarket,
    ownedTokenIds,
    asset,
    currentTokenId,
    onPresentSellCardModal,
    transferCard,
    transferState,
    removeMarket,
    removingMarket,
  ]);

  const renderCardProperties = useMemo(() => {
    if (
      asset &&
      asset.lsp8MetaData[currentTokenId]?.attributes &&
      asset.lsp8MetaData[currentTokenId].attributes.length > 0
    ) {
      return asset?.lsp8MetaData[currentTokenId].attributes.map((item) => {
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
    }
  }, [asset, currentTokenId, propertiesImages]);

  const renderContractDetailHeader = useMemo(
    () => (
      <StyledContractDetailHeader>
        <StyledContractName>{asset?.name}</StyledContractName>
        <StyledQuickActions>
          {ownedTokenIds && currentUsersPermissionsSet.call === '1' && (
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
            <StyledActionIcon src={ReloadIcon} alt="reload" title="reload" />
          </StyledReloadPriceAction>
          <StyledReloadPriceAction onClick={onPresentShareModal}>
            <StyledActionIcon src={ShareIcon} alt="share" title="share" />
          </StyledReloadPriceAction>
          <StyledReloadPriceAction>
            <StyledActionIcon src={OptionIcon} alt="options" title="options" />
          </StyledReloadPriceAction>
        </StyledQuickActions>
      </StyledContractDetailHeader>
    ),
    [
      asset?.name,
      currentUsersPermissionsSet.call,
      onPresentShareModal,
      onPresentTransferCardModal,
      ownedTokenIds,
    ],
  );

  const getHeroImgSrc = useMemo(() => {
    if (asset?.supportedInterface === 'erc721') {
      const img =
        asset?.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images &&
        asset?.lsp8MetaData[currentTokenId]?.image;
      return img && img.startsWith('ipfs://')
        ? Utils.convertImageURL(img)
        : img;
    } else if (asset?.supportedInterface === 'lsp8') {
      const img =
        asset?.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images &&
        asset?.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images[0][0]?.url;
      return img && img.startsWith('ipfs://')
        ? Utils.convertImageURL(img)
        : img;
    } else {
      const img =
        asset?.lsp8MetaData[0]?.LSP4Metadata?.images &&
        asset?.lsp8MetaData[0]?.LSP4Metadata?.images[0][0]?.url;
      return img && img.startsWith('ipfs://')
        ? Utils.convertImageURL(img)
        : img;
    }
  }, [asset?.lsp8MetaData, asset?.supportedInterface, currentTokenId]);

  const getOtherImgs = useMemo(() => {
    if (
      asset &&
      asset.supportedInterface === 'lsp4' &&
      asset.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images &&
      asset.lsp8MetaData[0]?.LSP4Metadata?.images.length > 1
    ) {
      return asset.lsp8MetaData[0]?.LSP4Metadata?.images.map((item, i) => {
        if (i !== 0) {
          return item[0]?.url.startsWith('ipfs://')
            ? Utils.convertImageURL(item[0].url)
            : item[0].url;
        }
      });
    } else if (
      asset &&
      asset.supportedInterface === 'lsp8' &&
      asset.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images &&
      asset.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images.length > 1
    ) {
      return asset.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images.map(
        (item, i) => {
          if (i !== 0) {
            return item[0]?.url.startsWith('ipfs://')
              ? Utils.convertImageURL(item[0].url)
              : item[0].url;
          }
        },
      );
    }
  }, [asset, currentTokenId]);

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
            asset && (
              <StyledAssetDetailContent>
                {!isDesktop && renderContractDetailHeader}
                <StyledMediaContainer>
                  <StyledHeroImgContainer>
                    <StyledHeroImg src={getHeroImgSrc} />
                    {asset.supportedInterface === 'lsp8' &&
                      wasActiveProfile &&
                      ownedTokenIds && (
                        <>
                          <StyledMintControls>
                            <StyledMintSkipButton onClick={previousMint}>
                              <StyledMintSkipButtonImg
                                src={BackwardsIcon}
                                alt=""
                              />
                            </StyledMintSkipButton>
                            <StyledMintSliderIndex>
                              <StyledMintSliderInput
                                type="number"
                                min={1}
                                max={ownedTokenIds.length}
                                defaultValue={currentIndex + 1}
                                ref={mintIdInputRef}
                                onKeyPress={onEnterHandler}
                                onBlur={onBlurHandler}
                              />
                              /{ownedTokenIds.length}
                            </StyledMintSliderIndex>
                            <StyledMintSkipButton onClick={nextMint}>
                              <StyledMintSkipButtonImg
                                src={ForwardsIcon}
                                alt=""
                              />
                            </StyledMintSkipButton>
                            <StyledSelectMintModalButton
                              onClick={onPresentSelectMintModal}
                            >
                              Select Mint
                            </StyledSelectMintModalButton>
                          </StyledMintControls>
                        </>
                      )}
                  </StyledHeroImgContainer>
                  {asset.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images &&
                    asset.lsp8MetaData[currentTokenId]?.LSP4Metadata?.images
                      .length > 1 &&
                    ['lsp8', 'lsp4'].includes(asset.supportedInterface) && (
                      <StyledOtherMediaContainer>
                        {getOtherImgs &&
                          getOtherImgs.length > 0 &&
                          getOtherImgs?.map((item, i) =>
                            item === undefined ? (
                              <></>
                            ) : (
                              <StyledOtherImg key={i} src={item} />
                            ),
                          )}
                      </StyledOtherMediaContainer>
                    )}
                  {asset.supportedInterface === 'lsp4' &&
                    asset.lsp8MetaData[currentTokenId].LSP4Metadata.assets.map(
                      (item) => {
                        if (item.fileType === 'mp4') {
                          return (
                            <StyledVideo
                              src={Utils.convertImageURL(item.url)}
                              controls
                            />
                          );
                        }
                      },
                    )}
                  {['lsp8', 'erc721'].includes(asset.supportedInterface) &&
                    (asset.lsp8MetaData[currentTokenId]?.animation_url ? (
                      <StyledVideo
                        src={Utils.convertImageURL(
                          asset.lsp8MetaData[currentTokenId].animation_url,
                        )}
                        controls
                      />
                    ) : (
                      <></>
                    ))}
                </StyledMediaContainer>
                <StyledAssetDetailContainer>
                  {isDesktop && renderContractDetailHeader}
                  <StyledContractDescription>
                    {asset.lsp8MetaData[0].description ||
                      asset.lsp8MetaData[0].LSP4Metadata.description}
                  </StyledContractDescription>
                  {!isDesktop && (
                    <CardInfoAccordion asset={asset} assetId={params.id} />
                  )}
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
                    />
                  )}

                  <StyledCardPropertiesAccordion
                    header={
                      <StyledAccordionTitle>Details</StyledAccordionTitle>
                    }
                    enableToggle
                  >
                    <StyledCardProperties>
                      {renderCardProperties}
                    </StyledCardProperties>
                  </StyledCardPropertiesAccordion>
                  {asset.supportedInterface === 'lsp8' && (
                    <StyledCardPriceWrapper>
                      <StyledCardPriceWrapperHeader>
                        <StyledCardPriceLabel>Item Price</StyledCardPriceLabel>
                      </StyledCardPriceWrapperHeader>

                      {renderCardPrice}
                    </StyledCardPriceWrapper>
                  )}
                  {isDesktop && (
                    <CardInfoAccordion asset={asset} assetId={params.id} />
                  )}
                  {asset.supportedInterface === 'lsp8' && (
                    <StyledMarketAccordion
                      header={
                        <StyledAccordionTitle>Market</StyledAccordionTitle>
                      }
                      enableToggle
                    >
                      {asset && (
                        <CardMarket
                          asset={asset}
                          cardMarkets={asset?.markets}
                          whiteListedTokens={asset?.whiteListedTokens}
                        />
                      )}
                    </StyledMarketAccordion>
                  )}
                  {['lsp4', 'lsp8'].includes(asset.supportedInterface) && (
                    <StyledHoldersAccordion
                      header={
                        <StyledAccordionTitle>
                          Other Holders
                        </StyledAccordionTitle>
                      }
                      enableToggle
                    >
                      {renderHolderPagination}
                    </StyledHoldersAccordion>
                  )}
                </StyledAssetDetailContainer>
              </StyledAssetDetailContent>
            )
          )}
        </>
      )}
    </StyledAssetDetailsContentWrapper>
  );
};

export default AssetDetails;
