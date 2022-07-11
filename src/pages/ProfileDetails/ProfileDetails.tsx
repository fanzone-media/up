import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { NetworkName, RootState, StringBoolean } from '../../boot/types';
import { theme } from '../../boot/styles';
import { useAppDispatch } from '../../boot/store';
import { HideOnScreen, Pagination } from '../../components';
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
  StyledOpenEditProfileModal,
  StyledWitdrawFundsButton,
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
import { useCopyText } from '../../hooks/useCopyText';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { getAddressPermissionsOnUniversalProfile } from '../../utility/permissions';
import {
  fetchIssuedCards,
  fetchOwnedCards,
  selectAllCardItems,
} from '../../features/cards';
import { ICard, IProfile } from '../../services/models';
import { MetaCard } from '../../features/cards/MetaCard';
import { StyledProfileHeading, StyledProfilesHeader } from '../Profiles/styles';
import { TransferCardsModal } from './TransferCardModal/TransferCardsModal';
import { useModal } from '../../hooks/useModal';
import { usePagination } from '../../hooks/usePagination';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { WithdrawFundsModal } from './WithdrawFundsModal';

interface IParams {
  add: string;
  network: NetworkName;
}

const ProfileDetails: React.FC = () => {
  const params = useParams<IParams>();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const [{ data: account }] = useAccount();
  const [{ data: signer }] = useSigner();

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
  const { setItem } = useLocalStorage();

  const isTablet = useMediaQuery(theme.screen.md);

  const [canTransfer, canSetData, canTransferValue] = useMemo(() => {
    if (!profile || !account) return [false, false, false];
    const permissionsSet = getAddressPermissionsOnUniversalProfile(
      profile.permissionSet,
      account.address,
    );
    return [
      permissionsSet?.permissions.call === StringBoolean.TRUE,
      permissionsSet?.permissions.setData === StringBoolean.TRUE,
      permissionsSet?.permissions.transferValue === StringBoolean.TRUE,
    ];
  }, [account, profile]);

  useMemo(() => {
    if (!account || !profile || !canTransfer || !canSetData) return;
    setItem(params.network, params.add, profile.permissionSet);
  }, [
    account,
    canSetData,
    canTransfer,
    params.add,
    params.network,
    profile,
    setItem,
  ]);

  useEffect(() => {
    dispatch(currentProfile(params.add));
    if (!profile)
      dispatch(
        fetchProfileByAddress({ address: params.add, network: params.network }),
      );
  }, [dispatch, params.add, params.network, profile]);

  const { range: issuedAssetsRange, setRange: setIssuedAssetsRange } =
    usePagination();
  const { range: ownedAssetsRange, setRange: setOwnedAssetsRange } =
    usePagination();

  const issuedCards = useSelector(selectAllCardItems).filter((item) =>
    profile?.issuedAssets
      .slice(issuedAssetsRange[0], issuedAssetsRange[1] + 1)
      .some((i) => i === item.address),
  );

  const issuedCardStatus = useSelector(
    (state: RootState) => state.cards.issuedStatus,
  );

  useEffect(() => {
    if (!profile || profile?.issuedAssets.length === 0) return;
    dispatch(
      fetchIssuedCards({
        addresses: profile.issuedAssets.slice(
          issuedAssetsRange[0],
          issuedAssetsRange[1] + 1,
        ),
        network: params.network,
      }),
    );
  }, [dispatch, profile, params.network, issuedAssetsRange]);

  const ownedCardStatus = useSelector(
    (state: RootState) => state.cards.ownedStatus,
  );

  const ownedCards = useSelector(selectAllCardItems).filter((item) =>
    profile?.ownedAssets
      .slice(ownedAssetsRange[0], ownedAssetsRange[1] + 1)
      .some((i) => i.assetAddress === item.address),
  );

  useEffect(() => {
    if (!profile || profile?.ownedAssets.length === 0) return;
    dispatch(
      fetchOwnedCards({
        addresses: profile.ownedAssets
          .map((asset) => asset.assetAddress)
          .slice(ownedAssetsRange[0], ownedAssetsRange[1] + 1),
        network: params.network,
      }),
    );
  }, [dispatch, profile, params.network, ownedAssetsRange]);

  const renderLinks = useMemo(
    () =>
      profile?.links?.map((link, i) => {
        const linkTitle = link.title.toLowerCase();
        return link.url !== '' ? (
          <StyledProfileLinks key={i}>
            <StyledLinkIconWrapper
              href={link.url}
              target="_blank"
              rel="noreferrer"
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
        ) : (
          <></>
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

  const {
    handlePresent: onPresentTransferCardsModal,
    onDismiss: onDismissTransferCardsModal,
  } = useModal(
    <TransferCardsModal
      profile={{
        address: profile?.address ? profile.address : '',
        owner: profile?.owner ? profile.owner : '',
        isOwnerKeyManager: profile?.isOwnerKeyManager
          ? profile.isOwnerKeyManager
          : false,
        ownedAssets: profile?.ownedAssets ? profile.ownedAssets : [],
      }}
      onDismiss={() => onDismissTransferCardsModal()}
    />,
    'Cards Transfer Modal',
    'Transfer Card',
  );

  const {
    handlePresent: onPresentProfileEditModal,
    onDismiss: onDismissProfileEditModal,
  } = useModal(
    <ProfileEditModal
      profile={profile ? profile : ({} as IProfile)}
      onDismiss={() => onDismissProfileEditModal()}
    />,
    'Profile Edit Modal',
    'Profile Edit',
  );

  const {
    handlePresent: onPresentWithdrawFundsModal,
    onDismiss: onDismissWithdrawFundsModal,
  } = useModal(
    profile && (
      <WithdrawFundsModal
        profile={profile}
        network={params.network}
        onDismiss={() => onDismissWithdrawFundsModal()}
      />
    ),
    'Withdraw Funds Modal',
    'Withdraw Funds',
  );

  return (
    <StyledProfileDetails>
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
              {profile &&
                account &&
                (canTransfer ||
                  profile.owner.toLowerCase() ===
                    account.address.toLowerCase()) && (
                  <StyledOpenTransferModalButton
                    onClick={onPresentTransferCardsModal}
                  >
                    Transfer Cards
                  </StyledOpenTransferModalButton>
                )}
              {signer &&
                profile &&
                account &&
                (canSetData ||
                  profile.owner.toLowerCase() ===
                    account.address.toLowerCase()) && (
                  <StyledOpenEditProfileModal
                    onClick={onPresentProfileEditModal}
                  >
                    Edit Profile
                  </StyledOpenEditProfileModal>
                )}
              {canTransferValue && (
                <StyledWitdrawFundsButton onClick={onPresentWithdrawFundsModal}>
                  Withdraw Funds
                </StyledWitdrawFundsButton>
              )}
              <StyledAssetsWrapper>
                {profile && profile.issuedAssets.length > 0 && (
                  <>
                    <StyledProfilesHeader>
                      <StyledProfileHeading>Issued Assets</StyledProfileHeading>
                    </StyledProfilesHeader>
                    <Pagination
                      status={issuedCardStatus}
                      components={issuedCards.map((digitalCard: ICard) => {
                        return (
                          <MetaCard
                            key={digitalCard.address}
                            digitalCard={digitalCard}
                            type="demo"
                            canTransfer={canTransfer}
                            profile={profile}
                          />
                        );
                      })}
                      nbrOfAllComponents={profile.issuedAssets.length}
                      setComponentsRange={setIssuedAssetsRange}
                    />
                  </>
                )}
                {/* @TODO: Change names of components StyledProfilesHeader and StyledProfileHeading */}
                {profile && profile.ownedAssets.length > 0 && (
                  <>
                    <StyledProfilesHeader>
                      <StyledProfileHeading>Owned Assets</StyledProfileHeading>
                    </StyledProfilesHeader>
                    <Pagination
                      status={ownedCardStatus}
                      components={ownedCards.map((digitalCard: ICard) => {
                        return (
                          <MetaCard
                            key={digitalCard.address}
                            digitalCard={digitalCard}
                            type="demo"
                            canTransfer={canTransfer}
                            profile={profile}
                          />
                        );
                      })}
                      nbrOfAllComponents={profile.ownedAssets.length}
                      setComponentsRange={setOwnedAssetsRange}
                    />
                  </>
                )}
              </StyledAssetsWrapper>
            </>
          )}
        </StyledProfileDetailsContent>
      )}
    </StyledProfileDetails>
  );
};

export default ProfileDetails;
