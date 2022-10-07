import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { useAppDispatch } from '../../../boot/store';
import { NetworkName, RootState } from '../../../boot/types';
import { Pagination } from '../../../components';
import {
  fetchAssetHolders,
  selectAllUsersItems,
} from '../../../features/profiles';
import { ProfileCard } from '../../../features/profiles/ProfileCard';
import { usePagination } from '../../../hooks/usePagination';
import { STATUS } from '../../../utility';

type IParams = {
  network: NetworkName;
  add: string;
};
interface IProps {
  holdersAddresses: string[];
}

export const HolderPagination = ({ holdersAddresses }: IProps) => {
  const dispatch = useAppDispatch();
  const params = useParams<IParams>();
  const holderStatus = useSelector(
    (state: RootState) => state.userData[params.network].status.fetchHolders,
  );

  const { range: profilesRange, setRange: setProfilesRange } = usePagination();

  const holders = useSelector((state: RootState) => {
    return selectAllUsersItems(state.userData[params.network]);
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
        network: params.network,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, holdersAddresses, params.network, profilesRange]);

  const renderHolders = useMemo(
    () =>
      holders.map((holder) => {
        const findBalanceOf = holder.ownedAssets.find(
          (item) => item.assetAddress === params.add.toLowerCase(),
        );
        return (
          <>
            <ProfileCard
              key={holder.address}
              balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
              userProfile={holder}
              type="holder"
              tooltipId="holderTooltip"
            />
            <ReactTooltip
              id="holderTooltip"
              getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
            ></ReactTooltip>
          </>
        );
      }),
    [holders, params.add],
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
