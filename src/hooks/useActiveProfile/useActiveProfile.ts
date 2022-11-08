import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import { fetchOwnerOfTokenId, selectUserById } from '../../features/profiles';
import { useUrlParams } from '../useUrlParams';

export const useActiveProfile = () => {
  const { network } = useUrlParams();
  const dispatch = useAppDispatch();
  const wasActiveProfile = useSelector((state: RootState) => state.userData.me);

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

  return {
    activeProfile: activeProfile ? activeProfile : null,
  };
};
