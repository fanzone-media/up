import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { NetworkName, RootState } from '../../boot/types';
import { fetchAllProfiles, selectAllUsersItems } from '../../features/profiles';
import { ICard, IProfile } from '../../services/models';
import { Pagination } from '../../components';
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
} from './styles';
import { Search } from '../../components';
import { useAppDispatch } from '../../boot/store';
import { useParams } from 'react-router-dom';
import { fetchAllCards, selectAllCardItems } from '../../features/cards';
import { MetaCard } from '../../features/cards/MetaCard';
import { useDefaultAddresses } from '../../hooks/useDefaultAddresses';
import { usePagination } from '../../hooks/usePagination';

interface IParams {
  network: NetworkName;
}

const Profiles: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();

  const { addresses: profileAddresses, error: errorLoadingProfileAddresses } =
    useDefaultAddresses('profileAddresses');
  const { addresses: assetsAddresses, error: errorLoadingAssetsAddresses } =
    useDefaultAddresses('assetsAddresses');

  const { range: profilesRange, setRange: setProfilesRange } = usePagination();
  const { range: assetsRange, setRange: setAssetsRange } = usePagination();

  useEffect(() => {
    if (profileAddresses.length === 0) return;
    dispatch(
      fetchAllProfiles({
        addresses: profileAddresses.slice(
          profilesRange[0],
          profilesRange[1] + 1,
        ),
        network: params.network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, profileAddresses, params.network, profilesRange]);

  const userProfiles = useSelector((state: RootState) =>
    selectAllUsersItems(state.userData[params.network]).filter((item) =>
      profileAddresses
        .slice(profilesRange[0], profilesRange[1] + 1)
        .some((i) => i === item.address && item.owner !== ''),
    ),
  );

  const userProfilesState = useSelector(
    (state: RootState) => state.userData[params.network].status,
  );

  const cards = useSelector(selectAllCardItems).filter((item) =>
    assetsAddresses
      .slice(assetsRange[0], assetsRange[1] + 1)
      .some((i) => i === item.address),
  );

  useEffect(() => {
    if (assetsAddresses.length === 0) return;
    dispatch(
      fetchAllCards({
        addresses: assetsAddresses.slice(assetsRange[0], assetsRange[1] + 1),
        network: params.network,
      }),
    );
  }, [dispatch, assetsAddresses, params.network, assetsRange]);

  const assetsState = useSelector((state: RootState) => state.cards.status);

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
        <StyledDivider />
        <>
          {errorLoadingProfileAddresses ? (
            <StyledProfilesHeader>
              <StyledProfileHeading>
                Error loading profiles
              </StyledProfileHeading>
            </StyledProfilesHeader>
          ) : (
            <>
              <StyledProfilesHeader>
                <StyledProfileHeading>Profiles</StyledProfileHeading>
                <Search />
              </StyledProfilesHeader>
              <Pagination
                status={userProfilesState}
                components={userProfiles.map((userProfile: IProfile) => (
                  <ProfileCard
                    key={userProfile.address}
                    userProfile={userProfile}
                    type="demo"
                  />
                ))}
                nbrOfAllComponents={profileAddresses.length}
                setComponentsRange={setProfilesRange}
              />
            </>
          )}
          {errorLoadingAssetsAddresses ? (
            <StyledProfilesHeader>
              <StyledProfileHeading>Error loading assets</StyledProfileHeading>
            </StyledProfilesHeader>
          ) : (
            <>
              <StyledProfilesHeader>
                <StyledProfileHeading>Assets</StyledProfileHeading>
                <Search />
              </StyledProfilesHeader>
              <Pagination
                status={assetsState}
                components={cards.map((asset: ICard) => (
                  <MetaCard
                    key={asset.address}
                    digitalCard={asset}
                    type="demo"
                  />
                ))}
                nbrOfAllComponents={assetsAddresses.length}
                setComponentsRange={setAssetsRange}
              />
            </>
          )}
        </>
      </StyledContentwrappar>
    </StyledMainContent>
  );
};

export default Profiles;
