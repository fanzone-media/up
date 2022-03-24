import React from 'react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { NetworkName, RootState } from '../../boot/types';
import { fetchAllProfiles, selectAllUsersItems } from '../../features/profiles';
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

interface IParams {
  network: NetworkName;
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

  const userProfiles = useSelector(
    (state: RootState) => selectAllUsersItems(state.userData[params.network]),
    // eslint-disable-next-line array-callback-return
  )?.filter((item) => {
    if (demoProfiles)
      return demoProfiles[params.network].some((i) => {
        return i === item.address && item.network === params.network;
      });
  });

  const demoCollection = useSelector(
    (state: RootState) => selectAllCardItems(state),
    // eslint-disable-next-line array-callback-return
  )?.filter((item) => {
    if (demoAssets)
      return demoAssets[params.network].some((i) => {
        return i === item.address && item.network === params.network;
      });
  });

  const cardStatus = useSelector((state: RootState) => {
    return state.userData[params.network].status;
  });

  const fetchDemoProfiles = () => {
    if (userProfiles?.length === 0) {
      dispatch(
        fetchAllProfiles({
          addresses: demoProfiles[params.network],
          network: params.network,
        }),
      );
    }
  };

  const fetchDemoCollection = () => {
    if (demoCollection.length === 0) {
      dispatch(
        fetchAllCards({
          addresses: demoAssets[params.network],
          network: params.network,
        }),
      );
    }
  };

  useMemo(() => {
    fetchDemoCollection();
    fetchDemoProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.network]);

  const renderProfiles = useMemo(
    () =>
      userProfiles?.map((userProfile: IProfile) => (
        <ProfileCard
          key={userProfile.address}
          userProfile={userProfile}
          type="demo"
        />
      )),
    [userProfiles],
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
