import { ICard, IMarket, IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import {
  StyledCardMarket,
  StyledCardMarketBuy,
  StyledCardMarketContainer,
  StyledCardMarketListHeader,
  StyledCardMarketListHeaderContent,
  StyledCardMarketMint,
  StyledCardMarketPrice,
  StyledCardMarketTable,
} from './styles';

interface IProps {
  asset?: ICard;
  cardMarkets?: IMarket[];
  whiteListedTokens?: IWhiteListedTokens[];
  onBuyClick: (tokenId: number) => void;
}

export const CardMarket = ({
  asset,
  cardMarkets,
  whiteListedTokens,
  onBuyClick,
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
      {/* {asset && <MetaCard digitalCard={asset} type="" />} */}
      <StyledCardMarketTable>
        <StyledCardMarketListHeader>
          <StyledCardMarketListHeaderContent>
            Mint
          </StyledCardMarketListHeaderContent>
          <StyledCardMarketListHeaderContent>
            Price
          </StyledCardMarketListHeaderContent>
        </StyledCardMarketListHeader>
        {cardMarkets.map((market) => (
          <StyledCardMarket>
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
            <StyledCardMarketBuy
              onClick={() => onBuyClick(Number(market.tokenId))}
            >
              Buy
            </StyledCardMarketBuy>
          </StyledCardMarket>
        ))}
      </StyledCardMarketTable>
    </StyledCardMarketContainer>
  ) : (
    <p>No markets available</p>
  );
};
