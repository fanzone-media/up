import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../boot/store';
import { NetworkName, RootState } from '../../../boot/types';
import {
  fetchAllMarkets,
  fetchCard,
  selectCardById,
} from '../../../features/cards';
import { STATUS } from '../../../utility';
import { CardMarket } from '../../AssetDetails/CardMarket';
import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import {
  StyledEmbedMarketContent,
  StyledEmbedMarketWrapper,
  StyledMessageLabel,
} from './styles';

interface IPrams {
  add: string;
  network: NetworkName;
  id: string;
}

export const EmbedMarket = () => {
  const params = useParams<IPrams>();
  const dispatch = useAppDispatch();
  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[params.network], params.add),
  );
  const cardStatus = useSelector(
    (state: RootState) => state.cards[params.network].status.fetchCard,
  );
  const marketsStatus = useSelector(
    (state: RootState) => state.cards[params.network].status.fetchMarket,
  );

  useEffect(() => {
    if (asset || cardStatus !== STATUS.IDLE) return;
    dispatch(
      fetchCard({
        address: params.add,
        network: params.network,
        tokenId: params.id,
      }),
    );
  }, [asset, cardStatus, dispatch, params.add, params.id, params.network]);

  useMemo(() => {
    if (!asset || marketsStatus !== STATUS.IDLE) return;

    dispatch(
      fetchAllMarkets({ assetAddress: params.add, network: params.network }),
    );
  }, [asset, dispatch, marketsStatus, params.add, params.network]);

  return (
    <StyledEmbedMarketContent>
      <ConnectToMetaMaskButton />
      <StyledEmbedMarketWrapper>
        {(cardStatus === STATUS.LOADING ||
          marketsStatus === STATUS.LOADING) && (
          <StyledMessageLabel>loading . . .</StyledMessageLabel>
        )}
        {asset &&
          cardStatus === STATUS.SUCCESSFUL &&
          marketsStatus !== STATUS.LOADING && (
            <CardMarket
              asset={asset}
              cardMarkets={asset?.markets}
              whiteListedTokens={asset?.whiteListedTokens}
            />
          )}
        {cardStatus === STATUS.FAILED && (
          <StyledMessageLabel>Card not found</StyledMessageLabel>
        )}
      </StyledEmbedMarketWrapper>
    </StyledEmbedMarketContent>
  );
};
