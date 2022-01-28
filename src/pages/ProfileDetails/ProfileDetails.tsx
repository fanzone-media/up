import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  fetchIssuedCards,
  fetchOwnedCards,
  selectAllCardItems,
  selectAllOwnedItems,
} from '../../features/cards';
import { useSelector } from 'react-redux';
import { RootState } from '../../boot/types';
import { useAppDispatch } from '../../boot/store';
import Pagination from '../../features/pagination/Pagination';
import makeBlockie from 'ethereum-blockies-base64';
import {
  StyledAssetsWrappar,
  StyledCopyLink,
  StyledCopyLinkIcon,
  StyledDropDownIcon,
  StyledFacebookIcon,
  StyledFaceBookShare,
  StyledLinkIcon,
  StyledProfileAddress,
  StyledProfileBio,
  StyledProfileBioHeading,
  StyledProfileBioWrappar,
  StyledProfileCoverImg,
  StyledProfileDetails,
  StyledProfileDetailsContent,
  StyledProfileInfo1,
  StyledProfileInfo1Content,
  StyledProfileInfo2,
  StyledProfileInfo2Content,
  StyledProfileInfoWrappar,
  StyledProfileLinks,
  StyledProfileMedia,
  StyledProfileMediaWrappar,
  StyledProfileName,
  StyledProfileNameBioWrappar,
  StyledProfileNotFound,
  StyledShareIcon,
  StyledShareProfileHeader,
  StyledShareProfileWrappar,
  StyledTwitterIcon,
  StyledTwitterShare,
} from './styles';
import { HeaderToolbar } from '../../components/HeaderToolbar';
import { ProfileImage } from './ProfileImage';
import {
  DropDownIcon,
  Facebook,
  Globe,
  Instagram,
  Link,
  ShareIcon,
  Twitter,
} from '../../assets';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { md } from '../../utility';
import Web3 from 'web3';
import { fetchUserAddress } from '../../services/controllers/LNS';
import Web3Service from '../../services/Web3Service';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { ILSP3Profile } from '../../services/models';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { StyledAssetsHeading } from '../../features/pagination/styles';

interface IParams {
  add: string;
  network: string;
}

const ProfileDetails: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();

  const [profileAddress, setProfileAddress] = useState<string>('');

  // const profile = useSelector((state: RootState) =>
  //   selectUserById(state, profileAddress),
  // );

  const [profile, setProfile] = useState<ILSP3Profile>();

  const [nameError, setNameError] = useState<boolean>(false);

  const [isShare, setIsShare] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  const isTablet = useMediaQuery(md);

  const history = useHistory();

  const issuedCollection = useSelector((state: RootState) =>
    selectAllCardItems(state),
  ).filter(
    (item) => item['owner'].toLowerCase() === profileAddress?.toLowerCase(),
  );

  const ownedCollection = useSelector((state: RootState) =>
    selectAllOwnedItems(state),
  ).filter((items) =>
    items['holders'].some(
      (item) => item.toLowerCase() === profileAddress?.toLowerCase(),
    ),
  );

  const ownedCollectionStatus = useSelector(
    (state: RootState) => state.cards.ownedItems.status,
  );

  useMemo(async () => {
    if (issuedCollection.length === 0) {
      dispatch(
        fetchIssuedCards({
          network: params.network,
          profileAddress: profileAddress ? profileAddress : '',
        }),
      );
    }
  }, [dispatch, profileAddress]);

  useMemo(async () => {
    const ownedAssetCount = await LSP4DigitalAssetApi.fetchOwnedCollectionCount(
      new Web3Service(),
    )(params.network, profileAddress);
    if (
      (ownedCollection.length === 0 ||
        ownedCollection.length !== ownedAssetCount) &&
      ownedAssetCount > 0
    ) {
      dispatch(
        fetchOwnedCards({
          network: params.network,
          profileAdd: profileAddress ? profileAddress : '',
        }),
      );
    }
  }, [dispatch, profileAddress]);

  const renderIssuedAssetsPagination = useMemo(
    () => <Pagination collection={issuedCollection} type="issued" />,
    [issuedCollection],
  );

  const renderOwnedAssetsPagination = useMemo(() => {
    return (
      <Pagination
        collection={ownedCollection}
        type="owned"
        profileAddr={profileAddress}
      />
    );
  }, [ownedCollection, profileAddress]);

  // const getOwnedAssets = async () => {
  //   const ownedAssetsCheck = ownedCollection.some((items) =>
  //     items['holders'].some((item) => item === profileAddress),
  //   );

  //   const ownedAssetCount = await LSP4DigitalAssetApi.fetchOwnedCollectionCount(
  //     new Web3Service(),
  //   )(profileAddress ? profileAddress : '');

  //   if (!ownedAssetsCheck && ownedCollection.length !== ownedAssetCount) {
  //     dispatch(fetchOwnedCards(profileAddress ? profileAddress : ''));
  //   }
  // };

  useMemo(async () => {
    console.log('Fetching Profile');
    setNameError(false);
    const checkParams = Web3.utils.isAddress(params.add);
    if (checkParams) {
      try {
        setProfileAddress(params.add);
        //dispatch(fetchProfileByAddress(params.add));
        await LSP3ProfileApi.fetchProfile(new Web3Service())(
          params.add,
          params.network,
        ).then((result) => {
          setProfile(result);
        });
      } catch (error: any) {
        console.error(error.message);
      }
    } else {
      const add = await fetchUserAddress(params.add, params.network).catch(
        (_error) => {
          setNameError(true);
        },
      );
      console.log(add);
      if (add) {
        try {
          setProfileAddress(add);
          //dispatch(fetchProfileByAddress(add));
          await LSP3ProfileApi.fetchProfile(new Web3Service())(
            add,
            params.network,
          ).then((result) => {
            setProfile(result);
          });
        } catch (error: any) {
          console.error(error.message);
        }
      } else {
        console.log('not found');
      }
    }
  }, [params.add]);

  const renderLinks = useMemo(
    () =>
      profile?.links?.map((link) => {
        const linkTitle = link.title.toLowerCase();
        if (linkTitle === 'twitter') {
          return (
            <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
              <StyledLinkIcon src={Twitter} />
            </a>
          );
        }
        if (linkTitle === 'instagram') {
          return (
            <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
              <StyledLinkIcon src={Instagram} />
            </a>
          );
        }
        if (linkTitle === 'facebook') {
          return (
            <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
              <StyledLinkIcon src={Facebook} />
            </a>
          );
        }
        return (
          <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
            <StyledLinkIcon src={Globe} />
          </a>
        );
      }),
    [profile?.links],
  );

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied((copied) => !copied);
    setTimeout(() => {
      setCopied((copied) => !copied);
    }, 2000);
  };

  const shareButtonHandler = () => {
    setIsShare((isShare) => !isShare);
  };

  const backHandler = () => {
    history.push('/');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.add]);

  return (
    <StyledProfileDetails className="relative flex flex-col w-full text-white window">
      <HeaderToolbar
        onBack={backHandler}
        buttonLabel="Back to profile"
        headerToolbarLabel="User Profile"
      />
      <StyledProfileDetailsContent>
        {nameError ? (
          <StyledProfileNotFound>Profile not found</StyledProfileNotFound>
        ) : (
          <>
            <StyledProfileCoverImg src={profile?.backgroundImage} alt="" />
            <StyledProfileInfoWrappar>
              <StyledProfileInfo1>
                <StyledProfileInfo1Content>
                  {isTablet && (
                    <StyledProfileAddress>
                      {profileAddress}
                    </StyledProfileAddress>
                  )}
                  <StyledProfileMediaWrappar>
                    <StyledProfileMedia>
                      <ProfileImage
                        profileImgSrc={profile?.profileImage}
                        blockieImgSrc={makeBlockie(
                          profileAddress ? profileAddress : params.add,
                        )}
                        profileAddress={profileAddress}
                      />
                    </StyledProfileMedia>
                  </StyledProfileMediaWrappar>
                  <StyledProfileNameBioWrappar>
                    <StyledProfileName>@{profile?.name}</StyledProfileName>
                    {!isTablet && (
                      <StyledProfileBioWrappar>
                        <StyledProfileBio>
                          {profile?.description}
                        </StyledProfileBio>
                      </StyledProfileBioWrappar>
                    )}
                    <StyledProfileLinks>{renderLinks}</StyledProfileLinks>
                  </StyledProfileNameBioWrappar>
                </StyledProfileInfo1Content>
              </StyledProfileInfo1>
              <StyledProfileInfo2>
                <StyledProfileInfo2Content>
                  {!isTablet && (
                    <StyledProfileAddress>{params.add}</StyledProfileAddress>
                  )}
                  <StyledShareProfileWrappar expand={isShare}>
                    <StyledShareProfileHeader
                      expand={isShare}
                      onClick={shareButtonHandler}
                    >
                      <StyledShareIcon src={ShareIcon} />
                      Share Profile
                      <StyledDropDownIcon src={DropDownIcon} />
                    </StyledShareProfileHeader>
                    <StyledTwitterShare
                      expand={isShare}
                      href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${profile?.name}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <StyledTwitterIcon src={Twitter} />
                      Twitter
                    </StyledTwitterShare>
                    <StyledFaceBookShare
                      href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <StyledFacebookIcon src={Facebook} />
                      Facebook
                    </StyledFaceBookShare>
                    <StyledCopyLink onClick={copyLink}>
                      <StyledCopyLinkIcon src={Link} />
                      {copied ? 'Copied' : 'Copy Link'}
                    </StyledCopyLink>
                  </StyledShareProfileWrappar>
                  {isTablet && (
                    <StyledProfileBioWrappar>
                      <StyledProfileBioHeading>Bio</StyledProfileBioHeading>
                      <StyledProfileBio>
                        {profile?.description}
                      </StyledProfileBio>
                    </StyledProfileBioWrappar>
                  )}
                </StyledProfileInfo2Content>
              </StyledProfileInfo2>
            </StyledProfileInfoWrappar>
            <StyledAssetsWrappar>
              {/* {issuedCollection.some((item) => item['owner'] === params.add) &&
              issuedFetchError !== 'No Assets' ? (
                  <Pagination collection={issuedCollection} type="issued" />
              ) : (
                <></>
              )} */}
              {issuedCollection.length > 0 ? (
                renderIssuedAssetsPagination
              ) : (
                <></>
              )}
              {/* {ownedCollection.length > 0 ? (
                <Pagination collection={ownedCollection} type="owned" />
              ) : (
                <>
                  <h2 className="uppercase">Owned Assets</h2>
                  <div className="mt-8 mx-auto">
                    <h1 className="text-lg font-light">
                      Has No Owned Assest
                    </h1>
                  </div>
                </>
              )} */}
              {ownedCollectionStatus === 'loading' && (
                <>
                  <StyledAssetsHeading>Owned Assets</StyledAssetsHeading>
                  <p>loading .......</p>
                </>
              )}
              {ownedCollection.length > 0 &&
                ownedCollectionStatus === 'idle' &&
                renderOwnedAssetsPagination}
              {ownedCollectionStatus === 'idle' &&
                ownedCollection.length === 0 && (
                  <>
                    <StyledAssetsHeading>Owned Assets</StyledAssetsHeading>
                    <p>Has No Owned Assets</p>
                  </>
                )}
            </StyledAssetsWrappar>
          </>
        )}
      </StyledProfileDetailsContent>
    </StyledProfileDetails>
  );
};

export default ProfileDetails;
