import React, { useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import {
  BackwardsIcon,
  CategoryPropertyIcon,
  EditionPropertyIcon,
  ForwardsIcon,
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
  resetCardsSliceInitialState,
  fetchCard,
  selectCardById,
} from '../../features/cards';
import { useEffect } from 'react';
import {
  fetchAssetCreator,
  fetchOwnerAddressOfTokenId,
  fetchProfileByAddress,
  resetUserDataSliceInitialState,
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
import { STATUS } from '../../utility';
import { TabedAccordion } from '../../components/TabedAccordion';
import { StyledAccordionTitle } from '../../components/Accordion/styles';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import ReactTooltip from 'react-tooltip';
import { IProfile } from '../../services/models';
import { HolderPagination } from './HoldersPagination';
import { DesktopCreatorsAccordion } from './DesktopCreatorsAccordion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { theme } from '../../boot/styles';
import { CardMarket } from './CardMarket';
import { useModal } from '../../hooks/useModal';
import { TransferCardTokenIdModal } from './TransferCardTokenIdModal';
import { SelectMintModalContent } from './SelectMintModalContent';
import Utils from '../../services/utilities/util';
import { CardInfoAccordion } from './components/CardInfoAccordion';
import { ShareReferModal } from '../../components/ShareReferModal';
import { useQueryParams } from '../../hooks/useQueryParams';
import { isAddress } from 'ethers/lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useFetchMarkets } from '../../hooks/useFetchMarkets';
import { useOwnedMints } from '../../hooks/useOwnedMints';
import { useActiveProfile } from '../../hooks/useActiveProfile';
import { useMintNavigation } from '../../hooks/useMintNavigation';
import { useMintMarket } from '../../hooks/useMintMarket';
import { AssetActions } from './AssetActions';
import { useCurrentUserPermissions } from '../../hooks/useCurrentUserPermissions';

interface IPrams {
  add: string;
  network: NetworkName;
  id: string;
}

const AssetDetails: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const mintIdInputRef = useRef<HTMLInputElement>(null);

  const params = useParams<IPrams>();
  const history = useHistory();
  const { pathname } = useLocation();
  let query = useQueryParams();

  const { setReferrer } = useLocalStorage();
  const isDesktop = useMediaQuery(theme.screen.md);

  const dispatch = useAppDispatch();

  const wasActiveProfile = useSelector((state: RootState) => state.userData.me);

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

  const cardError = useSelector(
    (state: RootState) => state.cards[params.network].error.fetchCard,
  );

  const cardStatus = useSelector(
    (state: RootState) => state.cards[params.network].status.fetchCard,
  );

  const metaDataStatus = useSelector(
    (state: RootState) => state.cards[params.network].status.fetchMetaData,
  );

  const creatorsStatus = useSelector(
    (state: RootState) => state.userData[params.network].status.fetchCreators,
  );

  const { activeProfile } = useActiveProfile();

  const currentUsersPermissions = useCurrentUserPermissions(wasActiveProfile);

  useFetchMarkets(asset);

  const { ownedTokenIds, currentTokenId } = useOwnedMints(
    wasActiveProfile ? wasActiveProfile : '',
    params.add,
    currentIndex,
  );

  const currentMintMarket = useMintMarket(params.add, params.id);

  const { nextMint, previousMint, mintChangeHelper } = useMintNavigation(
    currentIndex,
    setCurrentIndex,
    ownedTokenIds,
    mintIdInputRef,
    asset ? asset : null,
  );

  const ownerStatus = useSelector(
    (state: RootState) =>
      state.userData[params.network].status.fetchAllProfiles,
  );

  const creators = useSelector((state: RootState) =>
    selectAllUsersItems(state.userData[params.network]),
  )?.filter((item) => {
    return asset?.creators.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const onEnterHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    mintChangeHelper(val);
  };

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
    if (!params.id || !ownedTokenIds) return;
    setCurrentIndex(ownedTokenIds.indexOf(Number(params.id)));
  }, [ownedTokenIds, params.id]);

  useMemo(() => {
    if (!params.id && ownedTokenIds && asset?.supportedInterface === 'lsp8') {
      history.push(
        `/up/${params.network}/asset/${params.add}/${ownedTokenIds[currentIndex]}`,
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
    dispatch(resetUserDataSliceInitialState(params.network));
    dispatch(resetCardsSliceInitialState(params.network));
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

  const renderCardProperties = useMemo(() => {
    if (
      asset &&
      asset.lsp8MetaData[currentTokenId]?.attributes &&
      asset.lsp8MetaData[currentTokenId].attributes.length > 0
    ) {
      return asset?.lsp8MetaData[currentTokenId].attributes
        .slice(0)
        .reverse()
        .map((item) => {
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
                  <StyledCardPropertyValue>
                    {item.trait_type.toLowerCase() === 'score'
                      ? Number(item.value) / 100
                      : item.value}
                  </StyledCardPropertyValue>
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
          {ownedTokenIds && currentUsersPermissions.call === '1' && (
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
        </StyledQuickActions>
      </StyledContractDetailHeader>
    ),
    [
      asset?.name,
      currentUsersPermissions.call,
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
                                value={currentIndex + 1}
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
