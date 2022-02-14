import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { BlockScoutIcon, UniversalProfileIcon } from '../../assets';
import { useSelector } from 'react-redux';
import { RootState } from '../../boot/types';
import { fetchCard, selectCardById } from '../../features/cards';
import { useEffect } from 'react';
import {
  fetchAssetCreator,
  fetchAssetHolders,
  fetchProfileByAddress,
  selectAllEthereumUsersItems,
  selectAllL14UsersItems,
  selectAllMumbaiUsersItems,
  selectAllPolygonUsersItems,
  selectEthereumUserById,
  selectEthereumUserIds,
  selectL14UserById,
  selectL14UserIds,
  selectMumbaiUserById,
  selectMumbaiUserIds,
  selectPolygonUserById,
  selectPolygonUserIds,
} from '../../features/profiles';
import { useMemo } from 'react';
import { IBalanceOf, IProfile } from '../../services/models';
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

interface IPrams {
  add: string;
  network: string;
}

const AssetDetails: React.FC = () => {
  const params = useParams<IPrams>();
  const history = useHistory();
  const backHandler = () => {
    history.push('/');
  };

  const profiles = useSelector((state: RootState) => {
    switch (params.network) {
      case 'l14':
        return selectL14UserIds(state);
      case 'polygon':
        return selectPolygonUserIds(state);
      case 'mumbai':
        return selectMumbaiUserIds(state);
      case 'ethereum':
        return selectEthereumUserIds(state);
    }
 });

  const asset = useSelector((state: RootState) =>
    selectCardById(state, params.add),
  );

  const owner = useSelector((state: RootState) => {
    switch (params.network) {
      case 'l14':
        return selectL14UserById(state, asset?.owner ? asset.owner : '');
      case 'polygon':
        return selectPolygonUserById(state, asset?.owner ? asset.owner : '');
      case 'mumbai':
        return selectMumbaiUserById(state, asset?.owner ? asset.owner : '');
      case 'ethereum':
        return selectEthereumUserById(state, asset?.owner ? asset.owner : '');
    }
  });

  const holders = useSelector((state: RootState) => {
    switch (params.network) {
      case 'l14':
        return selectAllL14UsersItems(state);
      case 'polygon':
        return selectAllPolygonUsersItems(state);
      case 'mumbai':
        return selectAllMumbaiUsersItems(state);
      case 'ethereum':
        return selectAllEthereumUsersItems(state);
    }
 })?.filter((item) => {
  return asset?.holders.some((i) => {
    return i === item.address && item.network === params.network;
  });
});

  const creators = useSelector((state: RootState) =>{
    switch (params.network) {
      case 'l14':
        return selectAllL14UsersItems(state);
      case 'polygon':
        return selectAllPolygonUsersItems(state);
      case 'mumbai':
        return selectAllMumbaiUsersItems(state);
      case 'ethereum':
        return selectAllEthereumUsersItems(state);
    }
 })?.filter((item) => {
    return asset?.creators.some((i) => {
      return i === item.address && item.network === params.network;
    });
  });

  const cardError = useSelector((state: RootState) => state.cards.error);

  const cardStatus = useSelector((state: RootState) => state.cards.status);

  const dispatch = useAppDispatch();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [balanceOf, setBalanceOf] = useState<IBalanceOf[]>([]);

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

  // const getBalanceOf = async (address: string) => {
  //   return await LSP4DigitalAssetApi.fetchBalanceOf(new Web3Services())(
  //     params.add,
  //     address,
  //   );
  // };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.add, params.network]);

  const renderOwner = useMemo(() => {
    if (asset?.address === params.add) {
      if (owner?.address === asset.owner) {
        const findBalanceOf = balanceOf.find(
          (item) => item.address === owner.address,
        );
        return (
          <ProfileCard
            key={owner.address}
            userProfile={owner}
            balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
            type="owner"
          />
        );
      }
    }
  }, [asset?.address, asset?.owner, params.add, owner, balanceOf]);

  const renderDesigners = useMemo(
    () =>
      creators?.map((creator: IProfile) => {
        const findBalanceOf = balanceOf.find(
          (item) => item.address === creator.address,
        );
        return (
          <ProfileCard
            key={creator.address}
            userProfile={creator}
            balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
            type="creator"
          />
        );
      }),
    [creators, balanceOf],
  );

  const renderHolders = useMemo(
    () =>
      holders?.map((holder: IProfile) => {
        const findBalanceOf = balanceOf.find(
          (item) => item.address === holder.address,
        );
        return (
          <ProfileCard
            key={holder.address}
            userProfile={holder}
            balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
            type="holder"
          />
        );
      }),
    [holders, balanceOf],
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

  return (
    <StyledAssetDetailsContentWrappar>
      <HeaderToolbar
        onBack={backHandler}
        buttonLabel="Back to profile"
        headerToolbarLabel="Asset Details"
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
                    <a
                      href={
                        'https://universalprofile.cloud/asset/' + asset?.address
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <StyledUniversalProfileIcon
                        src={UniversalProfileIcon}
                        alt=""
                      />
                    </a>
                    <a
                      href={
                        'https://blockscout.com/lukso/l14/address/' +
                        asset?.address
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <StyledBlockScoutIcon src={BlockScoutIcon} alt="" />
                    </a>
                    <StyledStatsName>{metaCardInfo[0].data}</StyledStatsName>
                    <StyledMetaCardImg src={asset?.ls8MetaData.image} alt="" />
                  </StyledMediaWrappar>
                  <StyledDetailsWrappar>
                    <StyledCardInfoLabel>Card Info</StyledCardInfoLabel>
                    <StyledInfoGrid>
                      {metaCardInfo.map((items) => (
                        <div key={items.text}>
                          <StyledLabel>{items.text}</StyledLabel>
                          <StyledValue>{items.data}</StyledValue>
                        </div>
                      ))}
                    </StyledInfoGrid>
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
