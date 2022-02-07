import React from 'react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { RootState } from '../../boot/types';
import { selectAllUsersItems } from '../../features/profiles';
import { IProfile } from '../../services/models';
import { useEffect } from 'react';
import { selectAllCardItems } from '../../features/cards';
import { useAppDispatch } from '../../boot/store';
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
  StyledErrorContent,
  StyledReloadButton,
  StyledError,
} from './styles';
import { Search } from '../../components/Search';
import { useParams } from 'react-router-dom';

interface IParams {
  network: string;
}

const Profiles: React.FC = () => {
  const demoCollectionAddress = '0x5C604ce30001Bf97D72471adA70dFDf3dC21C0e4';
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();

  const userProfile = useSelector((state: RootState) =>
    selectAllUsersItems(state),
  );

  const userData = useSelector((state: RootState) => state.userData.users);

  const demoCollection = useSelector((state: RootState) =>
    selectAllCardItems(state),
  ).filter((items) => items['owner'] === demoCollectionAddress);

  // const getDemoCollection = async () => {
  //   if (
  //     !demoCollection.some((items) => items['owner'] === demoCollectionAddress)
  //   ) {
  //     dispatch(
  //       fetchIssuedCards({
  //         network: params.network,
  //         profileAddress: demoCollectionAddress,
  //       }),
  //     );
  //   }
  // };

  const renderProfiles = useMemo(
    () =>
      userProfile.map((userProfile: IProfile) => (
        <ProfileCard
          key={userProfile.address}
          userProfile={userProfile}
          type="demo"
        />
      )),
    [userProfile],
  );

  useEffect(() => {
    // getDemoCollection();
  }, []);

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
        {userData.status === 'failed' || userData.error ? (
          <StyledErrorContent>
            <StyledError>Something Went Wrong</StyledError>
            <StyledReloadButton
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload
            </StyledReloadButton>
          </StyledErrorContent>
        ) : (
          <>
            <StyledProfilesHeader>
              <StyledProfileHeading>Profiles</StyledProfileHeading>
              <Search />
            </StyledProfilesHeader>
            <StyledProfilesWrappar>{renderProfiles}</StyledProfilesWrappar>
            {demoCollection && (
              <Pagination collection={demoCollection} type="demo" />
            )}
          </>
        )}
      </StyledContentwrappar>
    </StyledMainContent>
  );
};

export default Profiles;
