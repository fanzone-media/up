import { ICard, IMarket, IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { BuyCardButton } from '../components/BuyCardButton';
import {
  StyledCardMarket,
  StyledCardMarketContainer,
  StyledCardMarketListHeader,
  StyledCardMarketListHeaderContent,
  StyledCardMarketMint,
  StyledCardMarketPrice,
  StyledCardMarketTable,
  StyledNoMarketLabel,
} from './styles';

interface IProps {
  asset: ICard;
  cardMarkets?: IMarket[];
  whiteListedTokens?: IWhiteListedTokens[];
}

export const CardMarket = ({
  asset,
  cardMarkets,
  whiteListedTokens,
}: IProps) => {
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

  return cardMarkets && cardMarkets.length > 0 && whiteListedTokens ? (
    <StyledCardMarketContainer>
      <StyledCardMarketTable>
        <StyledCardMarketListHeader>
          <StyledCardMarketListHeaderContent>
            Mint
          </StyledCardMarketListHeaderContent>
          <StyledCardMarketListHeaderContent>
            Price
          </StyledCardMarketListHeaderContent>
        </StyledCardMarketListHeader>
        {cardMarkets.map((market, i) => (
          <StyledCardMarket key={i}>
            <StyledCardMarketMint>
              {Number(market.tokenId)}
            </StyledCardMarketMint>
            <StyledCardMarketPrice>
              {displayPrice(
                market.minimumAmount,
                findDecimals(market.acceptedToken),
              )}{' '}
              {findSymbol(market.acceptedToken)}
            </StyledCardMarketPrice>
            {/* <StyledCardMarketBuy
              onClick={() => onBuyClick(Number(market.tokenId))}
            >
              Buy
            </StyledCardMarketBuy> */}
            <BuyCardButton asset={asset} mint={Number(market.tokenId)} />
          </StyledCardMarket>
        ))}
      </StyledCardMarketTable>
    </StyledCardMarketContainer>
  ) : (
    <StyledNoMarketLabel>No markets available</StyledNoMarketLabel>
  );
};
