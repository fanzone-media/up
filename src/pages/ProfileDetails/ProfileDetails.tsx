import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  fetchIssuedCards,
  fetchOwnedCards,
  selectAllCardItems,
  selectCardIds,
} from '../../features/cards';
import { useSelector } from 'react-redux';
import { NetworkName, RootState } from '../../boot/types';
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
  StyledOpenTransferModalButton,
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
import { StyledAssetsHeading } from '../../features/pagination/styles';
import { fetchProfileByAddress, selectUserById } from '../../features/profiles';
import { StyledLoader, StyledLoadingHolder } from '../AssetDetails/styles';
import { useAccount, useSigner } from 'wagmi';
import { ProfileEditModal } from './ProfileEditModal';
import { TransferCardModal } from './TransferCardModal';

interface IParams {
  add: string;
  network: NetworkName;
}

const ProfileDetails: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();
  const [{ data, error }] = useAccount();
  const [{ data: signer, error: signerError, loading }, getSigner] =
    useSigner();
  const [openEditProfileModal, setOpenEditProfileModal] =
    useState<boolean>(false);
  const [openTransferCardModal, setOpenTransferCardModal] =
    useState<boolean>(false);
  const [preSelectedAssetAddress, setPreSelectedAssetAddress] =
    useState<string>();

  const profile = useSelector((state: RootState) =>
    selectUserById(state.userData[params.network], params.add),
  );

  const cards = useSelector((state: RootState) => selectCardIds(state));

  const profileError = useSelector(
    (state: RootState) => state.userData[params.network].error,
  );

  const profileStatus = useSelector(
    (state: RootState) => state.userData[params.network].status,
  );

  const [isShare, setIsShare] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  const isTablet = useMediaQuery(md);

  const history = useHistory();

  const keyManagerSetDataPermission = useMemo(
    () =>
      profile &&
      data &&
      profile.permissionSet.length > 0 &&
      profile.permissionSet.some(
        (set) =>
          set.address.toLowerCase() === data.address.toLowerCase() &&
          set.permissions.setData === '1',
      ),
    [data, profile],
  );

  const keyManagerCallPermission = useMemo(
    () =>
      profile &&
      data &&
      profile.permissionSet.length > 0 &&
      profile.permissionSet.some(
        (set) =>
          set.address.toLowerCase() === data.address.toLowerCase() &&
          set.permissions.call === '1',
      ),
    [data, profile],
  );

  const issuedCollection = useSelector((state: RootState) =>
    selectAllCardItems(state),
  ).filter(
    (item) =>
      item['owner'].toLowerCase() === params.add?.toLowerCase() &&
      item['network'] === params.network,
  );

  const issuedCollectionStatus = useSelector(
    (state: RootState) => state.cards.issuedStatus,
  );

  const ownedCollection = useSelector((state: RootState) =>
    selectAllCardItems(state),
  ).filter((item) => {
    return profile?.ownedAssets.some((i) => {
      return i.assetAddress === item.address && item.network === params.network;
    });
  });

  const ownedCollectionStatus = useSelector(
    (state: RootState) => state.cards.ownedStatus,
  );

  const toggleTransferModal = (address: string) => {
    setPreSelectedAssetAddress(address);
    setOpenTransferCardModal(true);
  };

  useEffect(() => {
    if (!profile)
      dispatch(
        fetchProfileByAddress({ address: params.add, network: params.network }),
      );
  }, [dispatch, params.add, params.network, profile]);

  useMemo(() => {
    let addresses: string[] = [];
    profile?.issuedAssets.forEach((item) => {
      if (!cards.includes(item)) {
        addresses.push(item);
      }
    });
    if (addresses.length > 0) {
      dispatch(
        fetchIssuedCards({ network: params.network, addresses: addresses }),
      );
    }
  }, [cards, dispatch, params.network, profile?.issuedAssets]);

  useMemo(() => {
    let addresses: string[] = [];
    profile?.ownedAssets.forEach((item) => {
      if (!cards.includes(item.assetAddress)) {
        addresses.push(item.assetAddress);
      }
    });
    if (addresses.length > 0) {
      dispatch(
        fetchOwnedCards({ network: params.network, addresses: addresses }),
      );
    }
  }, [cards, dispatch, params.network, profile?.ownedAssets]);

  const renderIssuedAssetsPagination = useMemo(
    () => (
      <Pagination
        collection={issuedCollection}
        type="issued"
        openTransferCardModal={toggleTransferModal}
      />
    ),
    [issuedCollection],
  );

  const renderOwnedAssetsPagination = useMemo(() => {
    return (
      <Pagination
        collection={ownedCollection}
        type="owned"
        profile={profile}
        openTransferCardModal={toggleTransferModal}
        transferPermission={keyManagerCallPermission}
      />
    );
  }, [keyManagerCallPermission, ownedCollection, profile]);

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
    history.push(`/${params.network}`);
  };

  const getEditPermission = () => {
    if (
      profile &&
      data &&
      (keyManagerSetDataPermission ||
        profile.owner.toLowerCase() === data.address.toLowerCase())
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.add, profile]);

  return (
    <StyledProfileDetails>
      {signer &&
        profile &&
        data &&
        (keyManagerSetDataPermission ||
          profile.owner.toLowerCase() === data.address.toLowerCase()) && (
          <ProfileEditModal
            isOpen={openEditProfileModal}
            onClose={() => setOpenEditProfileModal(false)}
            signer={signer}
            profile={profile}
          />
        )}
      {signer &&
        profile &&
        data &&
        profile.ownedAssets.length > 0 &&
        (keyManagerCallPermission ||
          profile.owner.toLowerCase() === data.address.toLowerCase()) && (
          <TransferCardModal
            isOpen={openTransferCardModal}
            onClose={() => setOpenTransferCardModal(false)}
            signer={signer}
            profile={profile}
            selectecAddress={preSelectedAssetAddress}
          />
        )}
      <HeaderToolbar
        onBack={backHandler}
        buttonLabel="Back to profile"
        headerToolbarLabel="User Profile"
        showEditProfileButton={getEditPermission()}
        showProfileEditModal={() => setOpenEditProfileModal(true)}
      />
      {profileStatus === 'loading' ? (
        <StyledLoadingHolder>
          <StyledLoader color="#ed7a2d" />
        </StyledLoadingHolder>
      ) : (
        <StyledProfileDetailsContent>
          {profileError ? (
            <StyledProfileNotFound>Profile not found</StyledProfileNotFound>
          ) : (
            <>
              <StyledProfileCoverImg src={profile?.backgroundImage} alt="" />
              <StyledProfileInfoWrappar>
                <StyledProfileInfo1>
                  <StyledProfileInfo1Content>
                    {isTablet && (
                      <StyledProfileAddress>
                        {profile?.address}
                      </StyledProfileAddress>
                    )}
                    <StyledProfileMediaWrappar>
                      <StyledProfileMedia>
                        <ProfileImage
                          profileImgSrc={profile?.profileImage}
                          blockieImgSrc={makeBlockie(
                            profile ? profile.address : params.add,
                          )}
                          profileAddress={profile?.address}
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
              {signer &&
                profile &&
                data &&
                profile.ownedAssets.length > 0 &&
                (keyManagerCallPermission ||
                  profile.owner.toLowerCase() ===
                    data.address.toLowerCase()) && (
                  <StyledOpenTransferModalButton
                    onClick={() => setOpenTransferCardModal(true)}
                  >
                    Transfer Cards
                  </StyledOpenTransferModalButton>
                )}
              <StyledAssetsWrappar>
                {/* {issuedCollection.some((item) => item['owner'] === params.add) &&
              issuedFetchError !== 'No Assets' ? (
                  <Pagination collection={issuedCollection} type="issued" />
              ) : (
                <></>
              )} */}
                {profile &&
                  profile?.issuedAssets.length > 0 &&
                  issuedCollectionStatus === 'loading' && (
                    <>
                      <StyledAssetsHeading>Issued Assets</StyledAssetsHeading>
                      <StyledLoadingHolder>
                        <StyledLoader color="#ed7a2d" />
                      </StyledLoadingHolder>
                    </>
                  )}
                {issuedCollection.length > 0 &&
                issuedCollectionStatus === 'idle' ? (
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
                    <StyledLoadingHolder>
                      <StyledLoader color="#ed7a2d" />
                    </StyledLoadingHolder>
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
      )}
    </StyledProfileDetails>
  );
};

export default ProfileDetails;
