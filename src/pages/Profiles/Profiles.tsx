import React from 'react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { RootState } from '../../boot/types';
import {
  fetchAllProfiles,
  selectAllEthereumUsersItems,
  selectAllL14UsersItems,
  selectAllMumbaiUsersItems,
  selectAllPolygonUsersItems,
} from '../../features/profiles';
import { IProfile } from '../../services/models';
import { fetchAllCards, selectAllCardItems } from '../../features/cards';
import Pagination from '../../features/pagination/Pagination';
import {
  StyledContentwrappar,
  StyledDescription,
  StyledGreeting,
  StyledHeroSection,
  StyledMainContent,
  StyledDivider,
  StyledWelcomeHeading,
  StyledProfilesHeader,
  StyledProfileHeading,
  StyledProfilesWrappar,
} from './styles';
import { Search } from '../../components/Search';
import { useAppDispatch } from '../../boot/store';
import { useParams } from 'react-router-dom';
import { StyledLoader, StyledLoadingHolder } from '../AssetDetails/styles';
import { useSigner } from 'wagmi';

interface IParams {
  network: string;
}

const Profiles: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();

  const demoProfiles = {
    l14: ['', ''],
    mumbai: [
      '0x0044FA45A42b78A8cbAF6764D770864CBC94214C',
      '0x77de7a8c94789263Ba24D41D9D799190C73D3Acc',
    ],
    polygon: [
      '0x775e1dA80Bbe4C507D7009AB8D3a45c87b7f9D8A',
      '0x5e3Aa02aEE55c64a1253BFbe267CF9df94B8Cdbf',
    ],
    ethereum: ['', ''],
  };

  const demoAssets = {
    l14: ['', ''],
    mumbai: [
      '0x8839E144Bd2EddfDBC53B5b6323008bb3CE3eb7F',
      '0x9c7072122178107bf66571c1f3e379368e0e47a3',
    ],
    polygon: [
      '0xd83Bc6fB61fD75beDe9d3999d7345b5C1cB8b393',
      '0x90ada08949d5B32C9bF8d4DeCD27BE483bc5B0e2',
    ],
    ethereum: ['', ''],
  };

  const userProfile = useSelector((state: RootState) => {
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
    switch (params.network) {
      case 'l14':
        return demoProfiles?.l14.some((i) => {
          return i === item.address && item.network === params.network;
        });
      case 'polygon':
        return demoProfiles?.polygon.some((i) => {
          return i === item.address && item.network === params.network;
        });
      case 'mumbai':
        return demoProfiles?.mumbai.some((i) => {
          return i === item.address && item.network === params.network;
        });
      case 'ethereum':
        return demoProfiles?.ethereum.some((i) => {
          return i === item.address && item.network === params.network;
        });
    }
  });

  const demoCollection = useSelector((state: RootState) =>
    selectAllCardItems(state),
  )?.filter((item) => {
    switch (params.network) {
      case 'l14':
        return demoAssets?.l14.some((i) => {
          return i === item.address && item.network === params.network;
        });
      case 'polygon':
        return demoAssets?.polygon.some((i) => {
          return i === item.address && item.network === params.network;
        });
      case 'mumbai':
        return demoAssets?.mumbai.some((i) => {
          return i === item.address && item.network === params.network;
        });
      case 'ethereum':
        return demoAssets?.ethereum.some((i) => {
          return i === item.address && item.network === params.network;
        });
    }
  });

  const cardStatus = useSelector((state: RootState) => {
    switch (params.network) {
      case 'l14':
        return state.userData.l14.status;
      case 'polygon':
        return state.userData.polygon.status;
      case 'mumbai':
        return state.userData.mumbai.status;
      case 'ethereum':
        return state.userData.ethereum.status;
    }
  });

  const fetchDemoProfiles = () => {
    if (userProfile?.length === 0) {
      switch (params.network) {
        case 'l14':
          dispatch(
            fetchAllProfiles({
              addresses: demoProfiles.l14,
              network: params.network,
            }),
          );
          break;
        case 'mumbai':
          dispatch(
            fetchAllProfiles({
              addresses: demoProfiles.mumbai,
              network: params.network,
            }),
          );
          break;
        case 'polygon':
          dispatch(
            fetchAllProfiles({
              addresses: demoProfiles.polygon,
              network: params.network,
            }),
          );
          break;
        case 'ethereum':
          dispatch(
            fetchAllProfiles({
              addresses: demoProfiles.ethereum,
              network: params.network,
            }),
          );
          break;
      }
    }
  };

  const fetchDemoCollection = () => {
    if (demoCollection.length === 0) {
      switch (params.network) {
        case 'l14':
          dispatch(
            fetchAllCards({
              addresses: demoAssets.l14,
              network: params.network,
            }),
          );
          break;
        case 'mumbai':
          dispatch(
            fetchAllCards({
              addresses: demoAssets.mumbai,
              network: params.network,
            }),
          );
          break;
        case 'polygon':
          dispatch(
            fetchAllCards({
              addresses: demoAssets.polygon,
              network: params.network,
            }),
          );
          break;
        case 'ethereum':
          dispatch(
            fetchAllCards({
              addresses: demoAssets.ethereum,
              network: params.network,
            }),
          );
          break;
      }
    }
  };

  useMemo(() => {
    fetchDemoCollection();
  }, [params.network]);

  useMemo(async () => {
    fetchDemoProfiles();
  }, [params.network]);

  const renderProfiles = useMemo(
    () =>
      userProfile?.map((userProfile: IProfile) => (
        <ProfileCard
          key={userProfile.address}
          userProfile={userProfile}
          type="demo"
        />
      )),
    [userProfile],
  );

  return (
    <StyledMainContent>
      <StyledHeroSection></StyledHeroSection>
      <StyledContentwrappar>
        <StyledGreeting>
          <StyledWelcomeHeading>
            Welcome on Fanzone Profiles
          </StyledWelcomeHeading>
          <StyledDescription>
            Fanzone Profiles displays any data from the Blockchain which follows
            the standards of ERC725, LUKSO LSP1-3 and NFTs.
          </StyledDescription>
        </StyledGreeting>
        <StyledDivider></StyledDivider>
        <>
          <StyledProfilesHeader>
            <StyledProfileHeading>Profiles</StyledProfileHeading>
            <Search />
          </StyledProfilesHeader>
          {cardStatus === 'loading' ? (
            <StyledLoadingHolder>
              <StyledLoader color="#ed7a2d" />
            </StyledLoadingHolder>
          ) : (
            <StyledProfilesWrappar>{renderProfiles}</StyledProfilesWrappar>
          )}
          {demoCollection && (
            <Pagination collection={demoCollection} type="demo" />
          )}
        </>
      </StyledContentwrappar>
    </StyledMainContent>
  );
};

export default Profiles;
