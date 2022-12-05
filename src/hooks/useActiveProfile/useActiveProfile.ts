import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import {
  fetchOwnedAssetsAddresses,
  fetchOwnerOfTokenId,
  selectUserById,
} from '../../features/profiles';
import { STATUS } from '../../utility';
import { useUrlParams } from '../useUrlParams';

export const useActiveProfile = () => {
  const { network, tokenId } = useUrlParams();
  const dispatch = useAppDispatch();
  const wasActiveProfile = useSelector(
    (state: RootState) => tokenId && state.userData.me,
  );
  const userDataStatus = useSelector(
    (state: RootState) => state.userData[network].status,
  );

  const activeProfile = useSelector(
    (state: RootState) =>
      wasActiveProfile &&
      selectUserById(state.userData[network], wasActiveProfile),
  );
  useEffect(() => {
    if (activeProfile) return;

    wasActiveProfile &&
      dispatch(
        fetchOwnerOfTokenId({
          address: wasActiveProfile,
          network: network,
        }),
      );
  }, [activeProfile, dispatch, network, wasActiveProfile]);

  useEffect(() => {
    if (
      !activeProfile ||
      activeProfile.ownedAssets.length > 0 ||
      userDataStatus.fetchOwnedAssetsAddresses !== STATUS.IDLE
    )
      return;
    dispatch(
      fetchOwnedAssetsAddresses({
        profileAddress: activeProfile.address,
        network: network,
      }),
    );
  }, [
    dispatch,
    userDataStatus.fetchOwnedAssetsAddresses,
    network,
    activeProfile,
  ]);

  return {
    activeProfile: activeProfile ? activeProfile : null,
  };
};
