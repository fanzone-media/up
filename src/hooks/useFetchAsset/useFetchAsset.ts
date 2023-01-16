import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import { fetchCard, selectCardById } from '../../features/cards';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
import { useUrlParams } from '../useUrlParams';

export const useFetchAsset = (assetAddress: Address) => {
  const dispatch = useAppDispatch();
  const { network } = useUrlParams();
  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], assetAddress),
  );
  const status = useSelector(
    (state: RootState) => state.cards[network].status.fetchCard,
  );

  useEffect(() => {
    if (asset || status !== STATUS.IDLE) return;
    dispatch(
      fetchCard({
        address: assetAddress,
        network,
      }),
    );
  }, [asset, assetAddress, dispatch, network, status]);

  return { asset: asset ? asset : null, status };
};
