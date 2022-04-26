import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NetworkName, RootState } from '../../boot/types';
import { theme } from '../../boot/styles';
import { useAppDispatch } from '../../boot/store';
import { HideOnScreen } from '../../components';
import Pagination from '../../features/pagination/Pagination';
import makeBlockie from 'ethereum-blockies-base64';
import {
  StyledAssetsWrapper,
  StyledDropDownIcon,
  StyledLinkIconWrapper,
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
  StyledShareProfileHolder,
  StyledShareProfileButton,
  StyledShareDropDown,
  ShareLink,
  StyledShareProfileWrapper,
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
import { useCopyText } from '../../hooks/useCopyText';
import { useOutsideClick } from '../../hooks/useOutsideClick';

interface IParams {
  add: string;
  network: NetworkName;
}

const ProfileDetails: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
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

  const { copied, copyText, canCopy } = useCopyText();

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
        return (
          <StyledProfileLinks>
            <StyledLinkIconWrapper
              href={link.url}
              target="_blank"
              rel="noreferrer"
              key={link.url}
            >
              <StyledLinkIcon
                src={
                  linkTitle === 'twitter'
                    ? Twitter
                    : linkTitle === 'instagram'
                    ? Instagram
                    : linkTitle === 'facebook'
                    ? Facebook
                    : Globe
                }
              />
            </StyledLinkIconWrapper>
          </StyledProfileLinks>
        );
      }),
    [profile?.links],
  );

  const shareButtonRef = useRef(null);
  useOutsideClick(shareButtonRef, () => isShare && setIsShare(false));

  const shareButtonHandler = useCallback(async () => {
    try {
      await navigator.share({
        title: `Fanzone.io Universal Profile – ${profile && profile.address}`,
        text: `This is Fanzone.io's Universal Profile page for ${
          profile && profile.address
        }`,
        url: `${window.location.origin}/#${pathname}`,
      });
      console.log('shared successfully');
    } catch (err) {
      setIsShare((isShare) => !isShare);
      console.error('Error: ' + err);
    }
  }, [pathname, profile]);

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
                      <StyledShareProfileHolder>
                        {renderLinks}
                        <StyledShareProfileWrapper ref={shareButtonRef}>
                          <StyledShareProfileButton
                            onClick={shareButtonHandler}
                            isShare={isShare}
                          >
                            <StyledShareIcon src={ShareIcon} />
                            <HideOnScreen size="lg">
                              Share profile{' '}
                              {!navigator['share'] && (
                                <StyledDropDownIcon src={DropDownIcon} />
                              )}
                            </HideOnScreen>
                          </StyledShareProfileButton>
                          {isShare && (
                            <StyledShareDropDown>
                              <ShareLink
                                href={`https://twitter.com/intent/tweet?url=${window.location.origin}/#${pathname}`}
                              >
                                <img src={Twitter} alt="Twitter" />
                                Twitter
                              </ShareLink>
                              {/* <ShareLink>
                                <img src={Instagram} alt="Instagram" />
                                Instagram
                              </ShareLink> */}
                              <ShareLink
                                href={`https://www.facebook.com/sharer.php?u=${window.location.origin}/#${pathname}`}
                              >
                                <img src={Facebook} alt="Facebook" />
                                Facebook
                              </ShareLink>
                              {canCopy && (
                                <ShareLink
                                  as="button"
                                  onClick={() =>
                                    copyText(
                                      `${window.location.origin}/#${pathname}`,
                                    )
                                  }
                                >
                                  <img src={Link} alt="Copy Link" />
                                  {copied ? 'Copied!' : 'Copy Link'}
                                </ShareLink>
                              )}
                            </StyledShareDropDown>
                          )}
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
