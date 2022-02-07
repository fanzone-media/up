import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { BlockScoutIcon, UniversalProfileIcon } from '../../assets';
import { useSelector } from 'react-redux';
import { RootState } from '../../boot/types';
import { selectCardById } from '../../features/cards';
import { useEffect } from 'react';
import { selectUserById } from '../../features/profiles';
import { useMemo } from 'react';
import { IBalanceOf, ICard, IProfile } from '../../services/models';
import Web3Services from '../../services/Web3Service';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
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
} from './styles';
import { HeaderToolbar } from '../../components/HeaderToolbar';

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

  const assetData = useSelector((state: RootState) =>
    selectCardById(state, params.add),
  );

  const [asset, setAsset] = useState<ICard | null>();

  const ownerData = useSelector((state: RootState) =>
    selectUserById(state, asset?.owner ? asset.owner : ''),
  );
  const [owner, setOwner] = useState<IProfile>();

  const [designers, setDesigners] = useState<IProfile[]>([]);

  const [holders, setHolders] = useState<IProfile[]>([]);

  const [balanceOf, setBalanceOf] = useState<IBalanceOf[]>([]);

  const getOwner = async (address: string) => {
    if (ownerData) {
      const res = await getBalanceOf(ownerData.address);
      setBalanceOf((prevState) => [
        ...prevState,
        { address: ownerData.address, balance: res },
      ]);
      setOwner(ownerData);
    } else {
      const profile = await LSP3ProfileApi.fetchProfile(new Web3Services())(
        address,
        params.network,
      );
      const res = await getBalanceOf(profile.address);
      setBalanceOf((prevState) => [
        ...prevState,
        { address: profile.address, balance: res },
      ]);
      if (profile) setOwner(profile);
    }
  };

  const getHolders = async (address: string[]) => {
    const res = await LSP3ProfileApi.fetchAllProfiles(new Web3Services())(
      address,
      params.network,
    );
    res.forEach(async (item) => {
      const balanceOf = await getBalanceOf(item.address);
      setBalanceOf((prevState) => [
        ...prevState,
        { address: item.address, balance: balanceOf },
      ]);
    });
    setHolders(res);
  };

  const getCreators = async () => {
    try {
      const creators = await LSP3ProfileApi.fetchCreators(new Web3Services())(
        params.add,
        params.network,
      );
      console.log(creators);
      if (creators) {
        console.log("creatorsss")
        creators.forEach(async (item) => {
          const balanceOf = await getBalanceOf(item.address);
          setBalanceOf((prevState) => [
            ...prevState,
            { address: item.address, balance: balanceOf },
          ]);
        });
      }
      if (creators) setDesigners(creators);
    } catch (error: any) {
      console.error(error.message);
      setDesigners([]);
    }
  };

  const getAsset = async () => {
    if (assetData) {
      setAsset(assetData);
      getHolders(assetData.holders);
      getOwner(assetData.owner);
    } else {
      await LSP4DigitalAssetApi.fetchCard(new Web3Services())(
        params.add,
        params.network,
      ).then((value) => {
        setAsset(value);
        getHolders(value?.holders ? value.holders : []);
        getOwner(value?.owner ? value.owner : '');
      });
    }
  };

  const getBalanceOf = async (address: string) => {
    return await LSP4DigitalAssetApi.fetchBalanceOf(new Web3Services())(
      params.add,
      address,
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    getAsset();
    getCreators();
  }, [params.add]);

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
  }, [owner, params.add, balanceOf]);

  const renderDesigners = useMemo(
    () =>
      designers.map((creator: IProfile) => {
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
    [designers, params.add, balanceOf],
  );

  const renderHolders = useMemo(
    () =>
      holders.map((holder: IProfile) => {
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
    [holders, params.add, balanceOf],
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
      <StyledAssetDetailContent>
        <StyledGrid>
          <StyledAssetDetailGrid>
            <StyledMediaWrappar>
              <a
                href={'https://universalprofile.cloud/asset/' + asset?.address}
                target="_blank"
                rel="noreferrer"
              >
                <StyledUniversalProfileIcon src={UniversalProfileIcon} alt="" />
              </a>
              <a
                href={
                  'https://blockscout.com/lukso/l14/address/' + asset?.address
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
    </StyledAssetDetailsContentWrappar>
  );
};

export default AssetDetails;
