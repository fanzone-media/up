import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { UniversalProfileIcon } from '../../assets';
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
  StyledAssetDetailsContentWrappar,
  StyledGrid,
  StyledAssetDetailGrid,
  StyledExtraInfo,
  StyledCreatorLabel,
  StyledIssuerLabel,
  StyledIssuerWrappar,
  StyledCreatorWrappar,
  StyledHolderLabel,
  StyledHolderWrappar,
  StyledMediaWrappar,
  StyledMetaCardImg,
  StyledDetailsWrappar,
  StyledCardInfoLabel,
  StyledInfoGrid,
  StyledLabel,
  StyledValue,
  StyledFullName,
  StyledUniversalProfileIcon,
  StyledBlockScoutIcon,
  StyledStatsName,
  StyledCardError,
  StyledLoader,
  StyledLoadingHolder,
} from './styles';
import { HeaderToolbar } from '../../components/HeaderToolbar';
import { useAppDispatch } from '../../boot/store';
import { getChainExplorer } from '../../utility';
import ReactTooltip from 'react-tooltip';

interface IPrams {
  add: string;
  network: NetworkName;
}

const AssetDetails: React.FC = () => {
  const params = useParams<IPrams>();
  const history = useHistory();
  const backHandler = () => {
    history.push(`/${params.network}`);
  };
  const explorer = getChainExplorer(params.network);

  const profiles = useSelector((state: RootState) => selectUserIds(state));

  const asset = useSelector((state: RootState) =>
    selectCardById(state, params.add),
  );

  const owner = useSelector((state: RootState) =>
    selectUserById(state, asset?.owner ? asset.owner : ''),
  );

  const holders = useSelector((state: RootState) => {
    return selectAllUsersItems(state);
  })?.filter((item) => {
    return asset?.holders.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const creators = useSelector((state: RootState) =>
    selectAllUsersItems(state),
  )?.filter((item) => {
    return asset?.creators.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const cardError = useSelector((state: RootState) => state.cards.error);

  const cardStatus = useSelector((state: RootState) => state.cards.status);

  const dispatch = useAppDispatch();

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

  const renderCardProperties = useMemo(() => {
    const keys = asset && Object.keys(asset && asset.ls8MetaData);
    if (
      keys &&
      keys.includes('attributes') &&
      asset &&
      asset.ls8MetaData.attributes.length > 0
    ) {
      return asset.ls8MetaData.attributes.map((attribute: any, i) => (
        <React.Fragment key={i}>
          <StyledLabel>{attribute.trait_type}</StyledLabel>
          {Object.keys(attribute).includes('max_value') ? (
            <StyledValue>
              {attribute.value} of {attribute.max_value}
            </StyledValue>
          ) : (
            <StyledValue>{attribute.value}</StyledValue>
          )}
        </React.Fragment>
      ));
    } else {
      return metaCardInfo.map((items, i) => (
        <React.Fragment key={i}>
          <StyledLabel>{items.text}</StyledLabel>
          <StyledValue>{items.data}</StyledValue>
        </React.Fragment>
      ));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  return (
    <StyledAssetDetailsContentWrappar>
      <HeaderToolbar
        onBack={backHandler}
        buttonLabel="Back to profile"
        headerToolbarLabel="Asset Details"
        showEditProfileButton={false}
      />
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
              <StyledGrid>
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
              <StyledHolderWrappar>{renderHolders}</StyledHolderWrappar>
            </StyledAssetDetailContent>
          )}
        </>
      )}
    </StyledAssetDetailsContentWrappar>
  );
};

export default AssetDetails;
