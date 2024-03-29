import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../boot/types';
import { selectCardById } from '../../features/cards';
import { selectUserById } from '../../features/profiles';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
import { useUrlParams } from '../useUrlParams';

export const useOwnedMints = (
  profileAddress: Address,
  assetAddress: Address,
) => {
  const { tokenId, network } = useUrlParams();
  const profile = useSelector((state: RootState) =>
    selectUserById(state.userData[network], profileAddress),
  );
  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], assetAddress),
  );
  const metaDataStatus = useSelector(
    (state: RootState) => state.cards[network].status.fetchMetaData,
  );
  const ownedTokenIds = useMemo(
    () =>
      profile &&
      profile.ownedAssets.find(
        (item) =>
          item.assetAddress.toLowerCase() === assetAddress.toLowerCase(),
      )?.tokenIds,
    [assetAddress, profile],
  );

  const currentTokenId = useMemo(() => {
    let id: string = '0';
    if (
      asset?.supportedInterface === 'erc721' &&
      metaDataStatus !== STATUS.FAILED
    ) {
      id = tokenId ? tokenId : '0';
    } else if (asset?.supportedInterface === 'lsp8') {
      const index =
        ownedTokenIds && ownedTokenIds.indexOf(Number(tokenId)) >= 0
          ? ownedTokenIds.indexOf(Number(tokenId))
          : 0;
      id = ownedTokenIds ? ownedTokenIds[index].toString() : '0';
    }
    return id;
  }, [asset?.supportedInterface, metaDataStatus, ownedTokenIds, tokenId]);

  return {
    ownedTokenIds:
      ownedTokenIds && ownedTokenIds.length > 0 ? ownedTokenIds : null,
    currentTokenId,
  };
};
