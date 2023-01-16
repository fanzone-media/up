import { useFetchAsset } from '../../../hooks/useFetchAsset';
import { useFetchAuctionMarket } from '../../../hooks/useFetchAuctionMarket';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { STATUS } from '../../../utility';
import { AuctionMarket } from '../../AssetDetails/AuctionMarket';
import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import { StyledColorSpan, StyledMessageLabel } from '../EmbedMarket/styles';
import {
  StyledEmbedAuctionMarketContent,
  StyledEmbedAuctionMarketWrapper,
  StyledReloadAuctionMarketButton,
} from './styles';

export const EmbedAuctionMarket = () => {
  const { address } = useUrlParams();

  const { asset, status: assetStatus } = useFetchAsset(address);
  const { status: auctionMarketStatus } = useFetchAuctionMarket(address);

  return (
    <StyledEmbedAuctionMarketContent>
      <ConnectToMetaMaskButton />
      <StyledReloadAuctionMarketButton onClick={() => window.location.reload()}>
        Reload Auction Market
      </StyledReloadAuctionMarketButton>
      <StyledEmbedAuctionMarketWrapper>
        {(assetStatus === STATUS.LOADING ||
          auctionMarketStatus === STATUS.LOADING) && (
          <StyledMessageLabel>
            The auction market is currently{' '}
            <StyledColorSpan>being loaded . . .</StyledColorSpan>
          </StyledMessageLabel>
        )}
        {asset &&
          assetStatus === STATUS.SUCCESSFUL &&
          auctionMarketStatus !== STATUS.LOADING && (
            <AuctionMarket asset={asset} />
          )}
        {assetStatus === STATUS.FAILED && (
          <StyledMessageLabel>Card not found</StyledMessageLabel>
        )}
      </StyledEmbedAuctionMarketWrapper>
    </StyledEmbedAuctionMarketContent>
  );
};
