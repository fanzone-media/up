import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NetworkName, RootState } from '../../boot/types';
import { theme } from '../../boot/styles';
import { useAppDispatch } from '../../boot/store';
import Pagination from '../../features/pagination/Pagination';
import makeBlockie from 'ethereum-blockies-base64';
import {
  StyledAssetsWrapper,
  StyledCopyLink,
  StyledCopyLinkIcon,
  StyledDropDownIcon,
  StyledFacebookIcon,
  StyledFaceBookShare,
  StyledLinkIcon,
  StyledOpenTransferModalButton,
  StyledProfileAddress,
  StyledProfileCoverImg,
  StyledProfileDetails,
  StyledProfileDetailsContent,
  StyledProfileInfo1,
  StyledProfileInfo1Content,
  StyledProfileInfo2,
  StyledProfileInfo2Content,
  StyledProfileInfoWrapper,
  StyledProfileLinks,
  StyledProfileMedia,
  StyledProfileMediaWrapper,
  StyledProfileName,
  StyledProfileNameBioWrapper,
  StyledProfileNotFound,
  StyledShareIcon,
  StyledShareProfileHeader,
  StyledShareProfileHolder,
  StyledShareProfileWrapper,
  StyledTwitterIcon,
  StyledTwitterShare,
} from './styles';
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
import {
  currentProfile,
  fetchProfileByAddress,
  selectUserById,
} from '../../features/profiles';
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

  const [{ data }] = useAccount();
  const [{ data: signer }] = useSigner();
  const [openEditProfileModal, setOpenEditProfileModal] =
    useState<boolean>(false);
  const [openTransferCardModal, setOpenTransferCardModal] =
    useState<boolean>(false);
  const [preSelectedAssetAddress, setPreSelectedAssetAddress] =
    useState<string>();

  const profile = useSelector((state: RootState) =>
    selectUserById(state.userData[params.network], params.add),
  );

  const profileError = useSelector(
    (state: RootState) => state.userData[params.network].error,
  );

  const profileStatus = useSelector(
    (state: RootState) => state.userData[params.network].status,
  );

  const [isShare, setIsShare] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  const isTablet = useMediaQuery(theme.screen.md);

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

  const toggleTransferModal = (address: string) => {
    setPreSelectedAssetAddress(address);
    setOpenTransferCardModal(true);
  };

  useEffect(() => {
    dispatch(currentProfile(params.add));
    if (!profile)
      dispatch(
        fetchProfileByAddress({ address: params.add, network: params.network }),
      );
  }, [dispatch, params.add, params.network, profile]);

  const renderIssuedAssetsPagination = useMemo(
    () => (
      <Pagination
        type="issued"
        openTransferCardModal={toggleTransferModal}
        collectionAddresses={profile ? profile.issuedAssets : []}
      />
    ),
    [profile],
  );

  const renderOwnedAssetsPagination = useMemo(() => {
    return (
      <Pagination
        type="owned"
        profile={profile}
        openTransferCardModal={toggleTransferModal}
        transferPermission={keyManagerCallPermission}
        collectionAddresses={
          profile ? profile.ownedAssets.map((item) => item.assetAddress) : []
        }
      />
    );
  }, [keyManagerCallPermission, profile]);

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
              <StyledProfileInfoWrapper>
                <StyledProfileInfo1>
                  <StyledProfileInfo1Content>
                    {isTablet && (
                      <StyledProfileAddress>
                        {profile?.address}
                      </StyledProfileAddress>
                    )}
                    <StyledProfileMediaWrapper>
                      <StyledProfileMedia>
                        <ProfileImage
                          profileImgSrc={profile?.profileImage}
                          blockieImgSrc={makeBlockie(
                            profile ? profile.address : params.add,
                          )}
                          profileAddress={profile?.address}
                        />
                      </StyledProfileMedia>
                    </StyledProfileMediaWrapper>
                    <StyledProfileNameBioWrapper>
                      <StyledProfileName>@{profile?.name}</StyledProfileName>
                      <StyledProfileLinks>{renderLinks}</StyledProfileLinks>
                      <StyledShareProfileHolder>
                        <StyledShareProfileWrapper expand={isShare}>
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
                        </StyledShareProfileWrapper>
                      </StyledShareProfileHolder>
                    </StyledProfileNameBioWrapper>
                  </StyledProfileInfo1Content>
                </StyledProfileInfo1>
                <StyledProfileInfo2>
                  <StyledProfileInfo2Content>
                    {!isTablet && (
                      <StyledProfileAddress>{params.add}</StyledProfileAddress>
                    )}
                  </StyledProfileInfo2Content>
                </StyledProfileInfo2>
              </StyledProfileInfoWrapper>
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
              <StyledAssetsWrapper>
                {profile && profile.issuedAssets.length > 0 ? (
                  renderIssuedAssetsPagination
                ) : (
                  <></>
                )}
                {profile &&
                  profile.ownedAssets.length > 0 &&
                  renderOwnedAssetsPagination}
              </StyledAssetsWrapper>
            </>
          )}
        </StyledProfileDetailsContent>
      )}
    </StyledProfileDetails>
  );
};

export default ProfileDetails;
