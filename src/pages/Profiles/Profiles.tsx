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
  StyledHeaderSection,
  StyledHeaderContent,
  StyledMainContent,
  StyledHeading,
  StyledDivider,
  StyledProfilesHeader,
  StyledProfileHeading,
  StyledImg,
  StyledInfoSection,
  StyledInfoHeading,
  StyledInfoContent,
  StyledContainer,
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
import { useParams } from 'react-router-dom';
import { fetchAllCards, selectAllCardItems } from '../../features/cards';
import { MetaCard } from '../../features/cards/MetaCard';
import { useDefaultAddresses } from '../../hooks/useDefaultAddresses';
import { usePagination } from '../../hooks/usePagination';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  BgFanzoneHero,
  LuksoHeader,
  HeaderBackground,
  LuksoBadge,
  Lukso,
  HeaderAd,
  NftShowcaseIcon,
  NftBuyAndSellIcon,
  NftGrantPermissionIcon,
  NftTransferIcon,
  NftPersonaliseIcon,
  NftExchangeIcon,
} from '../../assets';

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

  const isTablet = useMediaQuery(theme.screen.md);
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

  const cards = useSelector((state: RootState) =>
    selectAllCardItems(state.cards[params.network]),
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
        network: params.network,
      }),
    );
  }, [dispatch, assetsAddresses, params.network, assetsRange]);

  const assetsState = useSelector(
    (state: RootState) => state.cards[params.network].status,
  );

  const luksoNetwork = params.network === 'l14' || params.network === 'l16';
  const imgUrl = LuksoHeader;

  const nftIconParams = [
    {
      url: NftShowcaseIcon,
      text: 'Showcase and share your NFTs',
    },
    {
      url: NftBuyAndSellIcon,
      text: 'Buy and sell NFTs (based on LSP8) decentrally from and to your Universal Profile',
    },
    {
      url: NftGrantPermissionIcon,
      text: 'Grant permission over each single NFTs & vaults to wallets and decentral Apps',
    },
    {
      url: NftTransferIcon,
      text: 'Transfer token & NFTs to yours and other wallets, look-up on blockscout',
    },
    {
      url: NftPersonaliseIcon,
      text: 'Personalise your own Universal Profile with pictures, social media links',
    },
    {
      url: NftExchangeIcon,
      text: 'Exchange LYX (of L16) to Wrapped LYX (on L16)',
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
              Universal Profiles are based on the maybe most advanced and
              decentral identity standard (ERC725), created by Fabian
              Vogelsteller and LUKSO. Instead of plain old wallets, a universal
              profile can be customised like a social media profile - but is in
              your complete control. You can collect any token and NFTs on it.
              And you can give any decentral
            </StyledDescription>
          </StyledInfoContent>
        </StyledInfoSection>
        {isTablet && <StyledDivider />}
        <StyledNftInfoSection>
          {nftIconParams.map(({ url, text }) => (
            <StyledNftInfo>
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
