import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../boot/store';
import { RootState } from '../../../boot/types';
import { Pagination } from '../../../components';
import {
  fetchAssetHolders,
  selectAllUsersItems,
} from '../../../features/profiles';
import { ProfileCard } from '../../../features/profiles/ProfileCard';
import { usePagination } from '../../../hooks/usePagination';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { STATUS } from '../../../utility';
interface IProps {
  holdersAddresses: string[];
}

export const HolderPagination = ({ holdersAddresses }: IProps) => {
  const dispatch = useAppDispatch();
  const { address, network } = useUrlParams();
  const holderStatus = useSelector(
    (state: RootState) => state.userData[network].status.fetchHolders,
  );

  const { range: profilesRange, setRange: setProfilesRange } = usePagination();

  const holders = useSelector((state: RootState) => {
    return selectAllUsersItems(state.userData[network]);
  }).filter((item) => {
    return holdersAddresses
      .slice(profilesRange[0], profilesRange[1] + 1)
      .some((i) => {
        return i === item.address;
      });
  });

  useEffect(() => {
    if (holderStatus === STATUS.LOADING || holdersAddresses.length === 0)
      return;
    dispatch(
      fetchAssetHolders({
        address: holdersAddresses.slice(profilesRange[0], profilesRange[1] + 1),
        network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, holdersAddresses, network, profilesRange]);

  const renderHolders = useMemo(
    () =>
      holders.map((holder) => (
        <ProfileCard key={holder.address} userProfile={holder} type="holder" />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holders, address, network],
  );

  return (
    <Pagination
      status={holderStatus}
      components={renderHolders}
      nbrOfAllComponents={holdersAddresses.length}
      setComponentsRange={setProfilesRange}
    />
  );
};
