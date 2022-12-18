import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../boot/types';
import { selectCardById } from '../../features/cards';
import { getAcceptedTokenDetails } from '../../utility';
import { Address } from '../../utils/types';
import { useUrlParams } from '../useUrlParams';

export const useMintMarket = (assetAddress: Address, tokenId: string) => {
  const { network } = useUrlParams();
  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], assetAddress),
  );

  const mintMarket = useMemo(() => {
    const market =
      asset &&
      asset.market &&
      asset.market.find((item) => Number(item.tokenId) === Number(tokenId));
    const token =
      asset &&
      market &&
      getAcceptedTokenDetails(asset.whiteListedTokens, market.acceptedToken);
    return (
      market && {
        ...market,
        decimals: token ? token.decimals : 18,
        symbol: token ? token.symbol : '',
      }
    );
  }, [asset, tokenId]);

  return mintMarket ? mintMarket : null;
};

export type MintMarketType = NonNullable<ReturnType<typeof useMintMarket>>;
