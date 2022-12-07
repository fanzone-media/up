import { Dispatch, RefObject, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../boot/store';
import { RootState } from '../../boot/types';
import { fetchMetaDataForTokenId } from '../../features/cards';
import { ICard } from '../../services/models';
import { STATUS } from '../../utility';
import { useUrlParams } from '../useUrlParams';

export const useMintNavigation = (
  ownedTokenIds: number[] | null,
  mintIdInputRef: RefObject<HTMLInputElement>,
  asset: ICard | null,
) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const history = useHistory();
  const dispatch = useAppDispatch();
  const { network, address, tokenId } = useUrlParams();
  const metaDataStatus = useSelector(
    (state: RootState) => state.cards[network].status.fetchMetaData,
  );

  const nextMint = () => {
    const nextIndex = currentIndex + 1;
    if (!ownedTokenIds || nextIndex >= ownedTokenIds.length) return;
    if (mintIdInputRef.current) {
      mintIdInputRef.current.value = (nextIndex + 1).toString();
    }
    history.push(`/up/${network}/asset/${address}/${ownedTokenIds[nextIndex]}`);
    setCurrentIndex(nextIndex);
  };

  const previousMint = () => {
    const previousIndex = currentIndex - 1;
    if (!ownedTokenIds || previousIndex < 0) return;
    if (mintIdInputRef.current) {
      mintIdInputRef.current.value = (previousIndex + 1).toString();
    }
    history.push(
      `/up/${network}/asset/${address}/${ownedTokenIds[previousIndex]}`,
    );
    setCurrentIndex(previousIndex);
  };

  const mintChangeHelper = (mint: number) => {
    if (ownedTokenIds && mint > 0 && mint <= ownedTokenIds.length) {
      history.push(
        `/up/${network}/asset/${address}/${ownedTokenIds[mint - 1]}`,
      );
      setCurrentIndex(mint - 1);
    }
  };

  useEffect(() => {
    if (
      ((ownedTokenIds && ownedTokenIds.length > 0) ||
        asset?.supportedInterface === 'erc721') &&
      asset &&
      !(tokenId in asset.lsp8MetaData) &&
      metaDataStatus === STATUS.IDLE
    ) {
      dispatch(
        fetchMetaDataForTokenId({
          assetAddress: address,
          network,
          tokenId,
          supportedInterface: asset.supportedInterface,
        }),
      );
    }
  }, [
    address,
    asset,
    dispatch,
    metaDataStatus,
    network,
    ownedTokenIds,
    tokenId,
  ]);

  return {
    nextMint,
    previousMint,
    mintChangeHelper,
    currentIndex,
    setCurrentIndex,
  };
};
