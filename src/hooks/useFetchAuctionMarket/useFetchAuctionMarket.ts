import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import { fetchAuctionMarket, selectCardById } from '../../features/cards';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
import { useUrlParams } from '../useUrlParams';

export const useFetchAuctionMarket = (assetAddress: Address) => {
  const { network } = useUrlParams();
  const dispatch = useAppDispatch();
  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], assetAddress),
  );
  const status = useSelector(
    (state: RootState) => state.cards[network].status.fetchAuctionMarket,
  );

  useEffect(() => {
    if (!asset || status !== STATUS.IDLE) return;
    dispatch(fetchAuctionMarket({ assetAddress, network }));
  }, [asset, assetAddress, dispatch, network, status]);

  return { auctionMarket: asset ? asset.auctionMarket : null, status };
};
