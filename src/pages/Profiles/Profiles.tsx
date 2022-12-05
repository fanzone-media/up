import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ProfileCard } from '../../features/profiles/ProfileCard';
import { RootState } from '../../boot/types';
import {
  fetchAllProfiles,
  resetUserDataSliceInitialState,
  selectAllUsersItems,
} from '../../features/profiles';
import { ICard, IProfile } from '../../services/models';
import { Pagination } from '../../components';
import {
  StyledContentwrappar,
  StyledDescription,
  StyledHeaderSection,
  StyledHeaderContent,
  StyledMainContent,
  StyledHeading,
  StyledDivider,
  StyledProfilesHeader,
  StyledProfileHeaderText,
  StyledImg,
  StyledInfoSection,
  StyledInfoHeading,
  StyledInfoContent,
  StyledLuksoBadge,
  StyledLuksoIcon,
  StyledLuksoLogo,
  StyledAd,
  StyledNftInfoSection,
  StyledNftInfo,
  StyledNftInfoIcon,
  StyledNftInfoText,
} from './styles';
import { Search } from '../../components';
import { theme } from '../../boot/styles';
import { useAppDispatch } from '../../boot/store';
import {
  fetchAllCards,
  resetCardsSliceInitialState,
  selectAllCardItems,
} from '../../features/cards';
import { MetaCard } from '../../features/cards/MetaCard';
import { useDefaultAddresses } from '../../hooks/useDefaultAddresses';
import { usePagination } from '../../hooks/usePagination';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  LuksoBadge,
  Lukso,
  NftShowcaseIcon,
  NftBuyAndSellIcon,
  NftGrantPermissionIcon,
  NftTransferIcon,
  NftPersonaliseIcon,
  NftExchangeIcon,
} from '../../assets';
import { useUrlParams } from '../../hooks/useUrlParams';

const Profiles: React.FC = () => {
  const { network } = useUrlParams();
  const dispatch = useAppDispatch();

  const { addresses: profileAddresses, error: errorLoadingProfileAddresses } =
    useDefaultAddresses('profileAddresses');
  const { addresses: assetsAddresses, error: errorLoadingAssetsAddresses } =
    useDefaultAddresses('assetsAddresses');

  const isTablet = useMediaQuery(theme.screen.md);
  const { range: profilesRange, setRange: setProfilesRange } = usePagination();
  const { range: assetsRange, setRange: setAssetsRange } = usePagination();

  useEffect(() => {
    dispatch(resetUserDataSliceInitialState(network));
    dispatch(resetCardsSliceInitialState(network));
  }, [dispatch, network]);

  useEffect(() => {
    if (profileAddresses.length === 0) return;
    dispatch(
      fetchAllProfiles({
        addresses: profileAddresses.slice(
          profilesRange[0],
          profilesRange[1] + 1,
        ),
        network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, profileAddresses, network, profilesRange]);

  const userProfiles = useSelector((state: RootState) =>
    selectAllUsersItems(state.userData[network]).filter((item) =>
      profileAddresses
        .slice(profilesRange[0], profilesRange[1] + 1)
        .some((i) => i === item.address && item.owner !== ''),
    ),
  );

  const userProfilesState = useSelector(
    (state: RootState) => state.userData[network].status.fetchAllProfiles,
  );

  const cards = useSelector((state: RootState) =>
    selectAllCardItems(state.cards[network]),
  ).filter((item) =>
    assetsAddresses
      .slice(assetsRange[0], assetsRange[1] + 1)
      .some((i) => i === item.address),
  );

  useEffect(() => {
    if (assetsAddresses.length === 0) return;
    dispatch(
      fetchAllCards({
        addresses: assetsAddresses.slice(assetsRange[0], assetsRange[1] + 1),
        network,
      }),
    );
  }, [dispatch, assetsAddresses, network, assetsRange]);

  const assetsState = useSelector(
    (state: RootState) => state.cards[network].status.fetchAllCards,
  );

  const nftIconParams = [
    {
      url: NftShowcaseIcon,
      text: 'Collect, interact and showcase your digital assets, most important share your passion.',
    },
    {
      url: NftBuyAndSellIcon,
      text: 'Be safe and secure by giving different levels of permissions to decentral Apps, wallets and vaults.',
    },
    {
      url: NftGrantPermissionIcon,
      text: 'Personalize your own Universal Profile with profile and header picture, social media links and more.',
    },
    {
      url: NftTransferIcon,
      text: 'Buy, sell and auction your NFTs decentrally right from Universal Profiles, where they already are.',
    },
    {
      url: NftPersonaliseIcon,
      text: 'Have true digital ownership of your profile, tokens (LSP7, LSP8, …) and over any other dApps.',
    },
    {
      url: NftExchangeIcon,
      text: 'Universal Profiles sync seamlessly with mobile and regular web applications, like FANZONE.io',
    },
  ];

  return (
    <StyledMainContent>
      <StyledHeaderSection>
        {!isTablet && (
          <StyledLuksoLogo>
            <StyledLuksoBadge>
              <StyledImg src={LuksoBadge} />
            </StyledLuksoBadge>
            <StyledLuksoIcon>
              <StyledImg src={Lukso} />
            </StyledLuksoIcon>
          </StyledLuksoLogo>
        )}
        <StyledHeaderContent>
          <StyledHeading>Token & NFT Wallet With Vault Manager</StyledHeading>
          <StyledDescription>
            Fanzone is backed by an amazing remote teamof 20+ creative & driven
            individuals.
          </StyledDescription>
        </StyledHeaderContent>
        {isTablet && <StyledAd />}
      </StyledHeaderSection>
      {!isTablet && <StyledAd />}
      <StyledContentwrappar>
        <StyledInfoSection>
          {isTablet && (
            <StyledLuksoLogo>
              <StyledLuksoBadge>
                <StyledImg src={LuksoBadge} />
              </StyledLuksoBadge>
              <StyledLuksoIcon>
                <StyledImg src={Lukso} />
              </StyledLuksoIcon>
            </StyledLuksoLogo>
          )}
          <StyledInfoContent>
            <StyledInfoHeading>What can you do with your UP?</StyledInfoHeading>
            <StyledDescription>
              Your Universal Profile can act as your digital identity and
              digital reputation in Web3 and Metaverse.
            </StyledDescription>
            <StyledDescription>
              We believe this is the most advanced and decentral identity
              standard (ERC725), created by Fabian Vogelsteller and brought
              forward through LUKSO and its vision.{' '}
            </StyledDescription>
            <StyledDescription>
              Instead of plain old wallets, a Universal Profile can be
              customized like a social media profile - but is in your complete
              control. It’s easy to use and fun, so it’s ready for mass
              adoption.
            </StyledDescription>
          </StyledInfoContent>
        </StyledInfoSection>
        {isTablet && <StyledDivider />}
        <StyledNftInfoSection>
          {nftIconParams.map(({ url, text }, i) => (
            <StyledNftInfo key={i}>
              <StyledNftInfoIcon>
                <StyledImg src={url} />
              </StyledNftInfoIcon>
              <StyledNftInfoText>{text}</StyledNftInfoText>
            </StyledNftInfo>
          ))}
        </StyledNftInfoSection>
        {isTablet && <StyledDivider />}
        <>
          {errorLoadingProfileAddresses ? (
            <StyledProfilesHeader>
              <StyledProfileHeaderText>
                Error loading profiles
              </StyledProfileHeaderText>
            </StyledProfilesHeader>
          ) : (
            <>
              <StyledProfilesHeader>
                <StyledProfileHeaderText>Profiles</StyledProfileHeaderText>
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
              <StyledProfileHeaderText>
                Error loading assets
              </StyledProfileHeaderText>
            </StyledProfilesHeader>
          ) : (
            <>
              <StyledProfilesHeader>
                <StyledProfileHeaderText>Assets</StyledProfileHeaderText>
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
