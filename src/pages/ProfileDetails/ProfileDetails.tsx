import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState, StringBoolean } from '../../boot/types';
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
  StyledShareProfileWrapper,
  StyledOpenEditProfileModal,
  StyledWitdrawFundsButton,
  StyledProfileSettingButton,
  StyledSettingIcon,
} from './styles';
import { ProfileImage } from './ProfileImage';
import {
  DropDownIcon,
  Facebook,
  Globe,
  Instagram,
  SettingIcon,
  ShareIcon,
  Twitter,
} from '../../assets';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  currentProfile,
  fetchIssuedAssetsAddresses,
  fetchOwnedAssetsAddresses,
  fetchProfileByAddress,
  resetUserDataSliceInitialState,
  selectUserById,
} from '../../features/profiles';
import { StyledLoader, StyledLoadingHolder } from '../AssetDetails/styles';
import { useAccount, useSigner } from 'wagmi';
import { ProfileEditModal } from './ProfileEditModal';
import { getAddressPermissionsOnUniversalProfile } from '../../utility/permissions';
import {
  fetchIssuedCards,
  fetchOwnedCards,
  resetCardsSliceInitialState,
  selectAllCardItems,
} from '../../features/cards';
import { ICard, IProfile } from '../../services/models';
import { MetaCard } from '../../features/cards/MetaCard';
import {
  StyledAssetsCheckText,
  StyledProfileHeaderText,
  StyledProfilesHeader,
} from '../Profiles/styles';
import { TransferCardsModal } from './TransferCardModal/TransferCardsModal';
import { useModal } from '../../hooks/useModal';
import { usePagination } from '../../hooks/usePagination';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { WithdrawFundsModal } from './WithdrawFundsModal';
import { ProfileSettingModal } from './ProfileSettingModal';
import { useQueryParams } from '../../hooks/useQueryParams';
import { isAddress } from 'ethers/lib/utils';
import { ShareReferModal } from '../../components/ShareReferModal';
import { STATUS } from '../../utility';
import { useUrlParams } from '../../hooks/useUrlParams';

const ProfileDetails: React.FC = () => {
  const { address, network } = useUrlParams();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  let query = useQueryParams();
  const { setItem, setReferrer } = useLocalStorage();
  const [{ data: account }] = useAccount();
  const [{ data: signer }] = useSigner();

  const { range: issuedAssetsRange, setRange: setIssuedAssetsRange } =
    usePagination();
  const { range: ownedAssetsRange, setRange: setOwnedAssetsRange } =
    usePagination();

  const activeProfileAddress = useSelector(
    (state: RootState) => state.userData.me,
  );

  const profile = useSelector((state: RootState) =>
    selectUserById(state.userData[network], address),
  );

  const cardsStatus = useSelector(
    (state: RootState) => state.cards[network].status,
  );

  const userDataStatus = useSelector(
    (state: RootState) => state.userData[network].status,
  );

  const issuedCards = useSelector((state: RootState) =>
    selectAllCardItems(state.cards[network]),
  ).filter((item) =>
    profile?.issuedAssets
      .slice(issuedAssetsRange[0], issuedAssetsRange[1] + 1)
      .some((i) => i === item.address),
  );

  const ownedCards = useSelector((state: RootState) =>
    selectAllCardItems(state.cards[network]),
  ).filter((item) =>
    profile?.ownedAssets
      .slice(ownedAssetsRange[0], ownedAssetsRange[1] + 1)
      .some((i) => i.assetAddress === item.address),
  );

  const isTablet = useMediaQuery(theme.screen.md);

  const [canTransfer, canSetData, canTransferValue, canAddPermissions] =
    useMemo(() => {
      if (!profile || !account) return [false, false, false];

      const permissionsSet = getAddressPermissionsOnUniversalProfile(
        profile.permissionSet,
        account.address,
      );
      return [
        permissionsSet?.permissions.call === StringBoolean.TRUE,
        permissionsSet?.permissions.setdata === StringBoolean.TRUE,
        permissionsSet?.permissions.transfervalue === StringBoolean.TRUE,
        permissionsSet?.permissions.addpermissions === StringBoolean.TRUE,
      ];
    }, [account, profile]);

  useMemo(() => {
    if (!account || !profile || !canTransfer || !canSetData) return;
    setItem(network, address, profile.permissionSet);
  }, [account, canSetData, canTransfer, address, network, profile, setItem]);

  useEffect(() => {
    const referrerAddress = query.get('referrer');
    referrerAddress &&
      isAddress(referrerAddress) &&
      setReferrer(network, referrerAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  useEffect(() => {
    dispatch(resetUserDataSliceInitialState(network));
    dispatch(resetCardsSliceInitialState(network));
  }, [dispatch, network, address]);

  useEffect(() => {
    if (address === activeProfileAddress) return;
    dispatch(currentProfile(address));
  }, [activeProfileAddress, address, dispatch]);

  useEffect(() => {
    if (!profile) dispatch(fetchProfileByAddress({ address, network }));
  }, [dispatch, address, network, profile]);

  useEffect(() => {
    if (
      !profile ||
      profile.issuedAssets.length > 0 ||
      userDataStatus.fetchIssuedAssetAddresses !== STATUS.IDLE
    )
      return;
    dispatch(
      fetchIssuedAssetsAddresses({
        profileAddress: profile.address,
        network: network,
      }),
    );
  }, [dispatch, userDataStatus.fetchIssuedAssetAddresses, network, profile]);

  useEffect(() => {
    if (
      !profile ||
      profile.ownedAssets.length > 0 ||
      userDataStatus.fetchOwnedAssetsAddresses !== STATUS.IDLE
    )
      return;
    dispatch(
      fetchOwnedAssetsAddresses({
        profileAddress: profile.address,
        network: network,
      }),
    );
  }, [dispatch, userDataStatus.fetchOwnedAssetsAddresses, network, profile]);

  useEffect(() => {
    if (!profile || profile?.issuedAssets.length === 0) return;
    dispatch(
      fetchIssuedCards({
        addresses: profile.issuedAssets.slice(
          issuedAssetsRange[0],
          issuedAssetsRange[1] + 1,
        ),
        network: network,
      }),
    );
  }, [dispatch, profile, network, issuedAssetsRange]);

  useEffect(() => {
    if (!profile || profile?.ownedAssets.length === 0) return;
    dispatch(
      fetchOwnedCards({
        addresses: profile.ownedAssets
          .map((asset) => asset.assetAddress)
          .slice(ownedAssetsRange[0], ownedAssetsRange[1] + 1),
        network: network,
      }),
    );
  }, [dispatch, profile, network, ownedAssetsRange]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

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

  const {
    handlePresent: onPresentSettingModal,
    onDismiss: onDismissSettingModal,
  } = useModal(
    profile && (
      <ProfileSettingModal
        profile={profile}
        onDismiss={() => onDismissSettingModal()}
      />
    ),
    'Profile Settings Modal',
    'Profile Settings',
  );

  const {
    handlePresent: onPresentTransferCardsModal,
    onDismiss: onDismissTransferCardsModal,
  } = useModal(
    profile && (
      <TransferCardsModal
        profile={profile}
        ownedCards={ownedCards}
        onDismiss={() => onDismissTransferCardsModal()}
        network={network}
      />
    ),
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
        network={network}
        onDismiss={() => onDismissWithdrawFundsModal()}
      />
    ),
    'Withdraw Funds Modal',
    'Withdraw Funds',
  );

  const { handlePresent: onPresentShareModal, onDismiss: onDismissShareModal } =
    useModal(
      <ShareReferModal
        network={network}
        pathName={pathname}
        onDismiss={() => onDismissShareModal()}
      />,
      'Profile Share Modal',
      'Share Profile',
    );

  return (
    <StyledProfileDetails>
      {userDataStatus.fetchProfile === STATUS.LOADING ? (
        <StyledLoadingHolder>
          <StyledLoader color="#ed7a2d" />
        </StyledLoadingHolder>
      ) : (
        <StyledProfileDetailsContent>
          {userDataStatus.fetchProfile === STATUS.FAILED && (
            <StyledProfileNotFound>Profile not found</StyledProfileNotFound>
          )}
          {(userDataStatus.fetchProfile === STATUS.SUCCESSFUL ||
            (userDataStatus.fetchProfile === STATUS.IDLE && profile)) && (
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
                            profile ? profile.address : address,
                          )}
                          profileAddress={profile?.address}
                        />
                      </StyledProfileMedia>
                    </StyledProfileMediaWrapper>
                    <StyledProfileNameBioWrapper>
                      <StyledProfileName>@{profile?.name}</StyledProfileName>
                      <StyledShareProfileHolder>
                        {renderLinks}
                        <StyledShareProfileWrapper>
                          <StyledShareProfileButton
                            onClick={onPresentShareModal}
                          >
                            <StyledShareIcon src={ShareIcon} />
                            <HideOnScreen size="lg">
                              Share profile{' '}
                              {!navigator['share'] && (
                                <StyledDropDownIcon src={DropDownIcon} />
                              )}
                            </HideOnScreen>
                          </StyledShareProfileButton>
                        </StyledShareProfileWrapper>
                      </StyledShareProfileHolder>
                      {(canAddPermissions || canSetData) && canTransfer && (
                        <StyledProfileSettingButton
                          onClick={onPresentSettingModal}
                        >
                          <StyledSettingIcon src={SettingIcon} />
                        </StyledProfileSettingButton>
                      )}
                    </StyledProfileNameBioWrapper>
                  </StyledProfileInfo1Content>
                </StyledProfileInfo1>
                <StyledProfileInfo2>
                  <StyledProfileInfo2Content>
                    {!isTablet && (
                      <StyledProfileAddress>{address}</StyledProfileAddress>
                    )}
                  </StyledProfileInfo2Content>
                </StyledProfileInfo2>
              </StyledProfileInfoWrapper>
              {profile &&
                account &&
                profile.ownedAssets.length > 0 &&
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
                {userDataStatus.fetchIssuedAssetAddresses ===
                  STATUS.LOADING && (
                  <StyledProfilesHeader>
                    <StyledAssetsCheckText>
                      checking for issued assets . . .
                    </StyledAssetsCheckText>
                  </StyledProfilesHeader>
                )}
                {profile &&
                  profile.issuedAssets.length > 0 &&
                  (userDataStatus.fetchIssuedAssetAddresses ===
                    STATUS.SUCCESSFUL ||
                    userDataStatus.fetchIssuedAssetAddresses ===
                      STATUS.IDLE) && (
                    <>
                      <StyledProfilesHeader>
                        <StyledProfileHeaderText>
                          Issued Assets
                        </StyledProfileHeaderText>
                      </StyledProfilesHeader>
                      <Pagination
                        status={cardsStatus.fetchIssuedCards}
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
                {userDataStatus.fetchOwnedAssetsAddresses ===
                  STATUS.LOADING && (
                  <StyledProfilesHeader>
                    <StyledAssetsCheckText>
                      checking for owned assets . . .
                    </StyledAssetsCheckText>
                  </StyledProfilesHeader>
                )}
                {profile &&
                  profile.ownedAssets.length > 0 &&
                  (userDataStatus.fetchOwnedAssetsAddresses ===
                    STATUS.SUCCESSFUL ||
                    userDataStatus.fetchOwnedAssetsAddresses ===
                      STATUS.IDLE) && (
                    <>
                      <StyledProfilesHeader>
                        <StyledProfileHeaderText>
                          Owned Assets
                        </StyledProfileHeaderText>
                      </StyledProfilesHeader>
                      <Pagination
                        status={cardsStatus.fetchOwnedCards}
                        components={ownedCards.map((digitalCard: ICard) => {
                          return (
                            <MetaCard
                              key={digitalCard.address}
                              digitalCard={digitalCard}
                              type="owned"
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
