import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  WethIcon,
  ZonePropertyIcon,
} from '../../assets';
import { useSelector } from 'react-redux';
import { NetworkName, RootState } from '../../boot/types';
import {
  fetchAllMarkets,
  fetchCard,
  fetchMetaDataForTokenId,
  selectCardById,
} from '../../features/cards';
import { useEffect } from 'react';
import { fetchProfileByAddress, selectUserById } from '../../features/profiles';
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
  StyledTokenIcon,
  StyledActionsButtonWrapper,
  StyledBuyButton,
  StyledMakeOfferButton,
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
} from './styles';
import { useAppDispatch } from '../../boot/store';
import { getChainExplorer, STATUS } from '../../utility';
// import ReactTooltip from 'react-tooltip';
// import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
// import { useSigner } from 'wagmi';
// import { Accordion } from '../../components/Accordion';
// import { HolderPagination } from './HoldersPagination';

interface IPrams {
  add: string;
  network: NetworkName;
  id: string;
}

const AssetDetails: React.FC = () => {
  const params = useParams<IPrams>();

  const explorer = getChainExplorer(params.network);

  const wasActiveProfile = useSelector((state: RootState) => state.userData.me);

  const activeUser = useSelector(
    (state: RootState) =>
      wasActiveProfile &&
      selectUserById(state.userData[params.network], wasActiveProfile),
  );

  // const profiles = useSelector((state: RootState) =>
  //   selectUserIds(state.userData[params.network]),
  // );

  const asset = useSelector((state: RootState) =>
    selectCardById(state, params.add),
  );

  const owner = useSelector((state: RootState) =>
    selectUserById(
      state.userData[params.network],
      asset?.owner ? asset.owner : '',
    ),
  );

  const ownerStatus = useSelector(
    (state: RootState) => state.userData[params.network].status,
  );

  // const creators = useSelector((state: RootState) =>
  //   selectAllUsersItems(state.userData[params.network]),
  // )?.filter((item) => {
  //   return asset?.creators.some((i) => {
  //     return i === item.address && item.network === params.network;
  //   });
  // });

  const cardError = useSelector((state: RootState) => state.cards.error);

  const cardStatus = useSelector((state: RootState) => state.cards.status);

  const marketsStatus = useSelector(
    (state: RootState) => state.cards.marketsStatus,
  );

  const metaDataStatus = useSelector(
    (state: RootState) => state.cards.metaDataStatus,
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const ownedTokenIds = useMemo(
    () =>
      activeUser &&
      activeUser.ownedAssets.find(
        (item) => item.assetAddress.toLowerCase() === params.add.toLowerCase(),
      )?.tokenIds,
    [activeUser, params.add],
  );

  const dispatch = useAppDispatch();

  // const tokenIdForSale = useMemo(
  //   async () =>
  //     params.id &&
  //     (await LSP4DigitalAssetApi.getTokenSale(
  //       params.add,
  //       Number(params.id),
  //       params.network,
  //     )),
  //   [params.add, params.network, params.id],
  // );

  useMemo(() => {
    if (!asset || owner || ownerStatus === STATUS.LOADING) return;

    dispatch(
      fetchProfileByAddress({
        address: asset.owner,
        network: params.network,
      }),
    );
  }, [asset, dispatch, owner, ownerStatus, params.network]);

  //getAllMarkets
  useMemo(() => {
    if (
      !asset ||
      marketsStatus === STATUS.LOADING ||
      marketsStatus === STATUS.FAILED
    )
      return;

    dispatch(
      fetchAllMarkets({ assetAddress: params.add, network: params.network }),
    );
  }, [asset, dispatch, marketsStatus, params.add, params.network]);

  useMemo(() => {
    if (
      !asset ||
      !params.id ||
      `${params.id}` in asset.ls8MetaData ||
      metaDataStatus === STATUS.LOADING
    )
      return;
    dispatch(
      fetchMetaDataForTokenId({
        assetAddress: params.add,
        network: params.network,
        tokenId: params.id,
      }),
    );
  }, [asset, dispatch, metaDataStatus, params.add, params.id, params.network]);

  useMemo(() => {
    if (
      !params.id &&
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
    params.id,
    params.network,
    wasActiveProfile,
  ]);

  // useMemo(() => {
  //   let addresses: string[] = [];
  //   asset?.holders.forEach((item) => {
  //     if (!profiles?.includes(item)) {
  //       addresses.push(item);
  //     }
  //   });
  //   if (addresses.length > 0) {
  //     dispatch(
  //       fetchAssetHolders({ address: addresses, network: params.network }),
  //     );
  //   }
  // }, [asset?.holders, dispatch, params.network, profiles]);

  // useMemo(() => {
  //   let addresses: string[] = [];
  //   asset?.creators.forEach((item) => {
  //     if (!profiles?.includes(item)) {
  //       addresses.push(item);
  //     }
  //   });
  //   if (addresses.length > 0) {
  //     dispatch(
  //       fetchAssetCreator({ address: addresses, network: params.network }),
  //     );
  //   }
  // }, [asset?.creators, dispatch, params.network, profiles]);

  useEffect(() => {
    if (!asset && cardStatus !== STATUS.LOADING) {
      dispatch(fetchCard({ address: params.add, network: params.network }));
    }
    window.scrollTo(0, 0);
  }, [asset, cardStatus, dispatch, params.add, params.network]);

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
    { label: 'Token Standard', value: '' },
    { label: 'Network', value: asset ? asset.network : '' },
    { label: 'Score', value: '' },
    { label: 'Current owner', value: '', valueType: 'address' },
  ];

  const nextMint = () => {
    const nextIndex = currentIndex + 1;
    if (!ownedTokenIds || nextIndex >= ownedTokenIds.length) return;
    setCurrentIndex(nextIndex);
  };

  const previousMint = () => {
    const previousIndex = currentIndex - 1;
    if (!ownedTokenIds || previousIndex < 0) return;
    setCurrentIndex(previousIndex);
  };

  // const renderOwner = useMemo(() => {
  //   if (asset?.address === params.add) {
  //     if (owner?.address === asset.owner) {
  //       const findBalanceOf = owner.ownedAssets.find(
  //         (item) => item.assetAddress === params.add.toLowerCase(),
  //       );
  //       return (
  //         <React.Fragment key={owner.address}>
  //           <ProfileCard
  //             userProfile={owner}
  //             balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
  //             type="owner"
  //             tooltipId="ownerTooltip"
  //           />
  //           <ReactTooltip
  //             id="ownerTooltip"
  //             getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
  //           ></ReactTooltip>
  //         </React.Fragment>
  //       );
  //     }
  //   }
  // }, [asset?.address, asset?.owner, params.add, owner]);

  // const renderDesigners = useMemo(
  //   () =>
  //     creators?.map((creator: IProfile) => {
  //       const findBalanceOf = creator.ownedAssets.find(
  //         (item) => item.assetAddress === params.add.toLowerCase(),
  //       );
  //       return (
  //         <React.Fragment key={creator.address}>
  //           <ProfileCard
  //             userProfile={creator}
  //             balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
  //             type="creator"
  //             tooltipId="designerTooltip"
  //           />
  //           <ReactTooltip
  //             id="designerTooltip"
  //             getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
  //           ></ReactTooltip>
  //         </React.Fragment>
  //       );
  //     }),
  //   [creators, params.add],
  // );

  // const renderHolderPagination = useMemo(
  //   () => <HolderPagination holdersAddresses={asset ? asset.holders : []} />,
  //   [asset],
  // );

  const renderCardPrice = useMemo(() => {
    const marketsForOwnedTokens =
      ownedTokenIds &&
      asset?.markets.filter((item) => {
        return ownedTokenIds.some((i) => {
          return i === Number(item.tokenId);
        });
      });
    const currentMintMarket =
      marketsForOwnedTokens &&
      ownedTokenIds &&
      marketsForOwnedTokens.find(
        (item) => Number(item.tokenId) === ownedTokenIds[currentIndex],
      );

    const urlTokenIdMarket = asset?.markets.find(
      (item) => Number(item.tokenId) === Number(params.id),
    );

    if (urlTokenIdMarket && params.id) {
      return (
        <>
          <StyledCardPriceValueWrapper>
            <StyledTokenIcon src={WethIcon} alt="" />
            <StyledCardPriceValue>
              {urlTokenIdMarket.minimumAmount.toNumber()}
            </StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledBuyButton>Buy now</StyledBuyButton>
            <StyledMakeOfferButton>Make offer</StyledMakeOfferButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }

    if (!currentMintMarket && ownedTokenIds) {
      return (
        <>
          <StyledCardPriceValueWrapper>
            <StyledTokenIcon src={WethIcon} alt="" />
            <StyledCardPriceValue>-</StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledSetPriceButton>Set price</StyledSetPriceButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }
    if (currentMintMarket && ownedTokenIds) {
      return (
        <>
          <StyledCardPriceValueWrapper>
            <StyledTokenIcon src={WethIcon} alt="" />
            <StyledCardPriceValue>
              {currentMintMarket.minimumAmount.toNumber()}
            </StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledChangePriceButton>Change price</StyledChangePriceButton>
            <StyledWithdrawButton>Withdraw from sale</StyledWithdrawButton>
          </StyledActionsButtonWrapper>
        </>
      );
    }
  }, [asset?.markets, currentIndex, ownedTokenIds, params.id]);

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
                  <StyledMedia
                    src={asset?.ls8MetaData[currentIndex]?.image}
                    alt=""
                  />
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
                        <StyledReloadPriceAction>
                          <StyledActionIcon src={ReloadIcon} />
                        </StyledReloadPriceAction>
                        <StyledReloadPriceAction>
                          <StyledActionIcon src={ShareIcon} />
                        </StyledReloadPriceAction>
                        <StyledReloadPriceAction>
                          <StyledActionIcon src={OptionIcon} />
                        </StyledReloadPriceAction>
                      </StyledQuickActions>
                    </StyledCardPriceWrapperHeader>
                    {renderCardPrice}
                  </StyledCardPriceWrapper>
                  <StyledCardInfoAccordion title="Card Info" enableToggle>
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
              <StyledCardPropertiesAccordion title="Details" enableToggle>
                <StyledCardProperties>
                  {renderCardProperties}
                </StyledCardProperties>
              </StyledCardPropertiesAccordion>
              <StyledMarketAccordion title="Market" enableToggle>
                <p>Market in progress...</p>
              </StyledMarketAccordion>
              <StyledHoldersAccordion title="Other Holders" enableToggle>
                {/* {renderHolderPagination} */}
              </StyledHoldersAccordion>
              {/* <StyledGrid>
                <StyledAssetDetailGrid>
                  <StyledMediaWrapper>
                    {params.network === 'l14' && (
                      <a
                        href={
                          'https://universalprofile.cloud/asset/' +
                          asset?.address
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <StyledUniversalProfileIcon
                          src={UniversalProfileIcon}
                          alt=""
                        />
                      </a>
                    )}
                    <a
                      href={explorer && explorer.exploreUrl + asset?.address}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <StyledBlockScoutIcon src={explorer?.icon} alt="" />
                    </a>
                    <StyledStatsName>{metaCardInfo[0].data}</StyledStatsName>
                    <StyledMetaCardImg src={asset?.ls8MetaData.image} alt="" />
                  </StyledMediaWrapper>
                  <StyledDetailsWrapper>
                    <StyledCardInfoLabel>Card Info</StyledCardInfoLabel>
                    <StyledInfoGrid>{renderCardProperties}</StyledInfoGrid>
                    <StyledFullName>{asset?.name}</StyledFullName>
                  </StyledDetailsWrapper>
                </StyledAssetDetailGrid>
                <StyledExtraInfo>
                  <StyledIssuerLabel>Issuer</StyledIssuerLabel>
                  <StyledIssuerWrapper>{renderOwner}</StyledIssuerWrapper>
                  <StyledCreatorLabel>Creator</StyledCreatorLabel>
                  <StyledCreatorWrapper>{renderDesigners}</StyledCreatorWrapper>
                </StyledExtraInfo>
              </StyledGrid>
              <StyledHolderLabel>Holder</StyledHolderLabel>
              <StyledHolderWrapper>{renderHolders}</StyledHolderWrapper> */}
            </StyledAssetDetailContent>
          )}
        </>
      )}
    </StyledAssetDetailsContentWrapper>
  );
};

export default AssetDetails;
