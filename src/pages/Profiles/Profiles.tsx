import React, { useEffect, useState } from 'react';
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
import { getDefaultAddresses } from '../../utility/content/addresses';
import { Address } from '../../utils/types';
import { fetchAllCards, selectAllCardItems } from '../../features/cards';
import { MetaCard } from '../../features/cards/MetaCard';

interface IParams {
  network: NetworkName;
}

const Profiles: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();
  const [demoProfiles, setDemoProfiles] = useState<Array<Address>>([]);
  // @TODO: show error message
  const [errorLoadingProfileAddresses, setErrorLoadingProfileAddresses] =
    useState();
  const [demoAssets, setDemoAssets] = useState<Array<Address>>([]);
  const [errorLoadingAssetsAddresses, setErrorLoadingAssetsAddresses] =
    useState();

  useEffect(() => {
    getDefaultAddresses(params.network, 'profileAddresses').then(
      (result) => {
        setDemoProfiles(result);
      },
      (error) => {
        setErrorLoadingProfileAddresses(error);
      },
    );
    getDefaultAddresses(params.network, 'assetsAddresses').then(
      (result) => {
        setDemoAssets(result);
      },
      (error) => {
        setErrorLoadingAssetsAddresses(error);
      },
    );
    // empty array to only call once
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [demoProfilesRange, setDemoProfilesRange] = useState<[number, number]>([
    0, 9,
  ]); // load first 11 by default
  const [demoAssetsRange, setDemoAssetsRange] = useState<[number, number]>([
    0, 9,
  ]); // load first 11 by default

  useEffect(() => {
    if (demoProfiles.length === 0) return;
    dispatch(
      fetchAllProfiles({
        addresses: demoProfiles.slice(
          demoProfilesRange[0],
          demoProfilesRange[1] + 1,
        ),
        network: params.network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, demoProfiles, params.network, demoProfilesRange]);

  const userProfiles = useSelector(
    (state: RootState) => selectAllUsersItems(state.userData[params.network]),
    // eslint-disable-next-line array-callback-return
  )?.filter((item) => {
    if (demoProfiles.length > 0) {
      return demoProfiles?.some(
        (i) => i === item.address && item.network === params.network,
      );
    }
  });

  const useProfilesState = useSelector(
    (state: RootState) => state.userData[params.network].status,
  );

  const allCollection = useSelector(selectAllCardItems).filter((item) =>
    demoAssets.some((i) => i === item.address),
  );

  useEffect(() => {
    if (demoAssets.length === 0) return;
    dispatch(
      fetchAllCards({
        addresses: demoAssets.slice(demoAssetsRange[0], demoAssetsRange[1] + 1),
        network: params.network,
        index: demoAssetsRange[0],
        arrayLength: demoAssets.length,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, demoAssets, params.network, demoAssetsRange]);

  const useAssetsState = useSelector((state: RootState) => state.cards.status);

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
          <Pagination
            status={useProfilesState}
            components={userProfiles.map((userProfile: IProfile) => (
              <ProfileCard
                key={userProfile.address}
                userProfile={userProfile}
                type="demo"
              />
            ))}
            nbrOfAllComponents={demoProfiles.length}
            setComponentsRange={setDemoProfilesRange}
          />
          {/* <Pagination type="demo" collectionAddresses={demoAssets} /> */}
          <StyledProfilesHeader>
            <StyledProfileHeading>Assets</StyledProfileHeading>
            <Search />
          </StyledProfilesHeader>
          <Pagination
            status={useAssetsState}
            components={allCollection.map((digitalCard: ICard) => {
              return (
                <MetaCard
                  key={digitalCard.address}
                  digitalCard={digitalCard}
                  type="demo"
                />
              );
            })}
            nbrOfAllComponents={demoAssets.length}
            setComponentsRange={setDemoAssetsRange}
          />
        </>
      </StyledContentwrappar>
    </StyledMainContent>
  );
};

export default Profiles;
