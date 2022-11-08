import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import { fetchAllMarkets } from '../../features/cards';
import { ICard } from '../../services/models';
import { STATUS } from '../../utility';
import { useUrlParams } from '../useUrlParams';

export const useFetchMarkets = (asset?: ICard) => {
  const { network } = useUrlParams();
  const dispatch = useAppDispatch();
  const marketsStatus = useSelector(
    (state: RootState) => state.cards[network].status.fetchMarket,
  );

  useEffect(() => {
    if (!asset || marketsStatus !== STATUS.IDLE) return;

    dispatch(
      fetchAllMarkets({ assetAddress: asset.address, network: network }),
    );
  }, [asset, dispatch, marketsStatus, network]);
};
