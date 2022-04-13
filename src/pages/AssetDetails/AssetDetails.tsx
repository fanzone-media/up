import React from 'react';
import { useParams } from 'react-router-dom';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import {
  OptionIcon,
  ReloadIcon,
  ShareIcon,
  UniversalProfileIcon,
  WethIcon,
} from '../../assets';
import { useSelector } from 'react-redux';
import { NetworkName, RootState } from '../../boot/types';
import { fetchCard, selectCardById } from '../../features/cards';
import { useEffect } from 'react';
import {
  fetchAssetCreator,
  fetchAssetHolders,
  fetchProfileByAddress,
  selectAllUsersItems,
  selectUserById,
  selectUserIds,
} from '../../features/profiles';
import { useMemo } from 'react';
import { IProfile } from '../../services/models';
import {
  StyledAssetDetailContent,
  StyledCardError,
  StyledLoader,
  StyledLoadingHolder,
  StyledAssetDetailsContentWrappar,
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
} from './styles';
import { useAppDispatch } from '../../boot/store';
import { getChainExplorer } from '../../utility';
import ReactTooltip from 'react-tooltip';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { useSigner } from 'wagmi';
import { Accordion } from '../../components/Accordion';

interface IPrams {
  add: string;
  network: NetworkName;
  id: string;
}

const AssetDetails: React.FC = () => {
  const params = useParams<IPrams>();
  const [{ data: signer, error: signerError, loading }, getSigner] =
    useSigner();
  const explorer = getChainExplorer(params.network);

  const profiles = useSelector((state: RootState) =>
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

  const holders = useSelector((state: RootState) => {
    return selectAllUsersItems(state.userData[params.network]);
  })?.filter((item) => {
    return asset?.holders.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const creators = useSelector((state: RootState) =>
    selectAllUsersItems(state.userData[params.network]),
  )?.filter((item) => {
    return asset?.creators.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const cardError = useSelector((state: RootState) => state.cards.error);

  const cardStatus = useSelector((state: RootState) => state.cards.status);

  const dispatch = useAppDispatch();

  const tokenIdForSale = useMemo(
    async () =>
      params.id &&
      (await LSP4DigitalAssetApi.getTokenSale(
        params.add,
        Number(params.id),
        params.network,
      )),
    [params.add, params.network, params.id],
  );

  useMemo(() => {
    if (!owner && asset) {
      dispatch(
        fetchProfileByAddress({
          address: asset.owner,
          network: params.network,
        }),
      );
    }
  }, [asset, dispatch, owner, params.network]);

  useMemo(() => {
    if (!asset) {
      dispatch(fetchCard({ address: params.add, network: params.network }));
    }
  }, [asset, dispatch, params.add, params.network]);

  useMemo(() => {
    let addresses: string[] = [];
    asset?.holders.forEach((item) => {
      if (!profiles?.includes(item)) {
        addresses.push(item);
      }
    });
    if (addresses.length > 0) {
      dispatch(
        fetchAssetHolders({ address: addresses, network: params.network }),
      );
    }
  }, [asset?.holders, dispatch, params.network, profiles]);

  useMemo(() => {
    let addresses: string[] = [];
    asset?.creators.forEach((item) => {
      if (!profiles?.includes(item)) {
        addresses.push(item);
      }
    });
    if (addresses.length > 0) {
      dispatch(
        fetchAssetCreator({ address: addresses, network: params.network }),
      );
    }
  }, [asset?.creators, dispatch, params.network, profiles]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.add, params.network]);

  const renderOwner = useMemo(() => {
    if (asset?.address === params.add) {
      if (owner?.address === asset.owner) {
        const findBalanceOf = owner.ownedAssets.find(
          (item) => item.assetAddress === params.add.toLowerCase(),
        );
        return (
          <React.Fragment key={owner.address}>
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
          </React.Fragment>
        );
      }
    }
  }, [asset?.address, asset?.owner, params.add, owner]);

  const renderDesigners = useMemo(
    () =>
      creators?.map((creator: IProfile) => {
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
      }),
    [creators, params.add],
  );

  const renderHolders = useMemo(
    () =>
      holders?.map((holder: IProfile) => {
        const findBalanceOf = holder.ownedAssets.find(
          (item) => item.assetAddress === params.add.toLowerCase(),
        );
        return (
          <React.Fragment key={holder.address}>
            <ProfileCard
              userProfile={holder}
              balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
              type="holder"
              tooltipId="holderTooltip"
            />
            <ReactTooltip
              id="holderTooltip"
              getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
            ></ReactTooltip>
          </React.Fragment>
        );
      }),
    [holders, params.add],
  );

  const metaCardInfo = [
    { text: 'Name', data: asset?.name.split('•')[0] },
    { text: 'Card Type', data: asset?.ls8MetaData.cardType },
    { text: 'Rarity', data: asset?.ls8MetaData.tierLabel },
    { text: 'Edition', data: asset?.ls8MetaData.edition },
    { text: 'Category', data: asset?.ls8MetaData.editionCategory },
    { text: 'Set', data: asset?.ls8MetaData.editionSet },
    { text: 'Season', data: asset?.ls8MetaData.season },
    { text: 'Zone', data: asset?.ls8MetaData.zoneLabel },
    { text: 'League', data: asset?.ls8MetaData.leagueLabel },
    { text: 'Team', data: asset?.ls8MetaData.teamLabel },
  ];

  // const renderCardProperties = useMemo(() => {
  //   const keys = asset && Object.keys(asset && asset.ls8MetaData);
  //   if (
  //     keys &&
  //     keys.includes('attributes') &&
  //     asset &&
  //     asset.ls8MetaData.attributes.length > 0
  //   ) {
  //     return asset.ls8MetaData.attributes.map((attribute: any, i) => (
  //       <React.Fragment key={i}>
  //         <StyledLabel>{attribute.trait_type}</StyledLabel>
  //         {Object.keys(attribute).includes('max_value') ? (
  //           <StyledValue>
  //             {attribute.value} of {attribute.max_value}
  //           </StyledValue>
  //         ) : (
  //           <StyledValue>{attribute.value}</StyledValue>
  //         )}
  //       </React.Fragment>
  //     ));
  //   } else {
  //     return metaCardInfo.map((items, i) => (
  //       <React.Fragment key={i}>
  //         <StyledLabel>{items.text}</StyledLabel>
  //         <StyledValue>{items.data}</StyledValue>
  //       </React.Fragment>
  //     ));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [asset]);

  return (
    <StyledAssetDetailsContentWrappar>
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
                  <StyledMedia src={asset?.ls8MetaData.image} alt="" />
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
                    <StyledCardPriceValueWrapper>
                      <StyledTokenIcon src={WethIcon} alt="" />
                      <StyledCardPriceValue>
                        11.5 ($35,023.25)
                      </StyledCardPriceValue>
                    </StyledCardPriceValueWrapper>
                    <StyledActionsButtonWrapper>
                      <StyledBuyButton>Buy now</StyledBuyButton>
                      <StyledMakeOfferButton>Make offer</StyledMakeOfferButton>
                    </StyledActionsButtonWrapper>
                  </StyledCardPriceWrapper>
                  <Accordion title="Card Info" enableToggle>
                    <StyledCardInfo></StyledCardInfo>
                  </Accordion>
                </StyledCardInfoWrapper>
              </StyledCardMainDetails>
              {/* <StyledGrid>
                <StyledAssetDetailGrid>
                  <StyledMediaWrappar>
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
                  </StyledMediaWrappar>
                  <StyledDetailsWrappar>
                    <StyledCardInfoLabel>Card Info</StyledCardInfoLabel>
                    <StyledInfoGrid>{renderCardProperties}</StyledInfoGrid>
                    <StyledFullName>{asset?.name}</StyledFullName>
                  </StyledDetailsWrappar>
                </StyledAssetDetailGrid>
                <StyledExtraInfo>
                  <StyledIssuerLabel>Issuer</StyledIssuerLabel>
                  <StyledIssuerWrappar>{renderOwner}</StyledIssuerWrappar>
                  <StyledCreatorLabel>Creator</StyledCreatorLabel>
                  <StyledCreatorWrappar>{renderDesigners}</StyledCreatorWrappar>
                </StyledExtraInfo>
              </StyledGrid>
              <StyledHolderLabel>Holder</StyledHolderLabel>
              <StyledHolderWrappar>{renderHolders}</StyledHolderWrappar> */}
            </StyledAssetDetailContent>
          )}
        </>
      )}
    </StyledAssetDetailsContentWrappar>
  );
};

export default AssetDetails;
