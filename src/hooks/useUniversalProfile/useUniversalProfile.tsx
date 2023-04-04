import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { NetworkName, RootState } from '../../boot/types';
import { fetchProfileByAddress, selectUserById } from '../../features/profiles';
import { Address } from '../../utils/types';

export const useUniversalProfile = (
  universalProfileAddress: Address,
  network: NetworkName,
) => {
  const UPA = universalProfileAddress;
  const dispatch = useAppDispatch();
  const universalProfile = useSelector((state: RootState) =>
    selectUserById(state.userData[network], universalProfileAddress),
  );
  const error = useSelector(
    (state: RootState) => state.userData[network].error.fetchProfile,
  );
  const status = useSelector(
    (state: RootState) => state.userData[network].status.fetchProfile,
  );

  const fetchData = (universalProfileAddress?: Address) => {
    dispatch(
      fetchProfileByAddress({
        address: universalProfileAddress ? universalProfileAddress : UPA,
        network,
      }),
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universalProfileAddress, network]);

  return { data: universalProfile, error, status, refetch: fetchData };
};
