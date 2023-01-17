import { DateTime } from 'luxon';
import { ICard } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { Bidbutton } from '../components/BidButton';
import {
  StyledAuctionMarket,
  StyledAuctionMarketCurrentBid,
  StyledAuctionMarketEndsIn,
  StyledAuctionMarketItem,
  StyledAuctionMarketListHeader,
  StyledAuctionMarketListHeaderContent,
  StyledAuctionMarketMinBid,
  StyledAuctionMarketMint,
  StyledAuctionMarketSeller,
  StyledAuctionMarketTable,
  StyledNoAuctionMarketLabel,
} from './styles';

interface IProps {
  asset: ICard;
}

export const AuctionMarket = ({ asset }: IProps) => {
  const { whiteListedTokens, auctionMarket } = asset;

  const findDecimals = (tokenAddress: string) => {
    const decimals =
      whiteListedTokens &&
      whiteListedTokens.find((item) => item.tokenAddress === tokenAddress)
        ?.decimals;
    return decimals ? decimals : 0;
  };

  const findSymbol = (tokenAddress: string) => {
    const symbol =
      whiteListedTokens &&
      whiteListedTokens.find((item) => item.tokenAddress === tokenAddress)
        ?.symbol;
    return symbol ? symbol : '';
  };

  return auctionMarket && auctionMarket.length > 0 ? (
    <StyledAuctionMarket>
      <StyledAuctionMarketTable>
        <StyledAuctionMarketListHeader>
          <StyledAuctionMarketListHeaderContent>
            Mint
          </StyledAuctionMarketListHeaderContent>
          <StyledAuctionMarketListHeaderContent>
            Min. Bid
          </StyledAuctionMarketListHeaderContent>
          <StyledAuctionMarketListHeaderContent>
            Curr. Bid
          </StyledAuctionMarketListHeaderContent>
          <StyledAuctionMarketListHeaderContent>
            Seller
          </StyledAuctionMarketListHeaderContent>
          <StyledAuctionMarketListHeaderContent>
            Ends in
          </StyledAuctionMarketListHeaderContent>
        </StyledAuctionMarketListHeader>
        {auctionMarket?.map((market, i) => (
          <StyledAuctionMarketItem key={i}>
            <StyledAuctionMarketMint>
              {Number(market.tokenId)}
            </StyledAuctionMarketMint>
            <StyledAuctionMarketMinBid>
              {displayPrice(
                market.auction.minimumBid,
                findDecimals(market.auction.acceptedToken),
              )}{' '}
              {findSymbol(market.auction.acceptedToken)}
            </StyledAuctionMarketMinBid>
            <StyledAuctionMarketCurrentBid>
              {displayPrice(
                market.auction.activeBidAmount,
                findDecimals(market.auction.acceptedToken),
              )}{' '}
              {findSymbol(market.auction.acceptedToken)}
            </StyledAuctionMarketCurrentBid>
            <StyledAuctionMarketSeller>
              {/* {market.auction.seller} */}
            </StyledAuctionMarketSeller>
            <StyledAuctionMarketEndsIn>
              {DateTime.fromSeconds(market.auction.endTime).toLocaleString(
                DateTime.DATETIME_SHORT,
              )}
            </StyledAuctionMarketEndsIn>
            <Bidbutton asset={asset} auctionMarket={market} />
          </StyledAuctionMarketItem>
        ))}
      </StyledAuctionMarketTable>
    </StyledAuctionMarket>
  ) : (
    <StyledNoAuctionMarketLabel>No market available</StyledNoAuctionMarketLabel>
  );
};
