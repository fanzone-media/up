import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import { fetchAllMarkets, selectCardById } from '../../features/cards';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
import { useUrlParams } from '../useUrlParams';

export const useFetchMarkets = (assetAddress: Address) => {
  const { network } = useUrlParams();
  const dispatch = useAppDispatch();
  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], assetAddress),
  );
  const status = useSelector(
    (state: RootState) => state.cards[network].status.fetchMarket,
  );

  useEffect(() => {
    if (!asset || status !== STATUS.IDLE) return;

    dispatch(
      fetchAllMarkets({ assetAddress: asset.address, network: network }),
    );
  }, [asset, dispatch, status, network]);

  return { market: asset ? asset.market : null, status };
};
