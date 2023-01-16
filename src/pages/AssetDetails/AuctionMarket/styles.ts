import styled from 'styled-components';

export const StyledAuctionMarket = styled.div`
  padding: 2em 0;
  display: flex;
`;

export const StyledNoAuctionMarketLabel = styled.h3`
  margin: auto;
`;

export const StyledAuctionMarketTable = styled.div`
  width: 100%;
`;

export const StyledAuctionMarketListHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5em;
  border-radius: 0.5em;
  margin-bottom: 1.5em;
`;

export const StyledAuctionMarketListHeaderContent = styled.h4``;

export const StyledAuctionMarketItem = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: 1em;

  &:nth-child(even) {
    border-radius: 0.5em;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 45.66%,
      rgba(255, 255, 255, 0) 97.77%
    );
  }
`;

export const StyledAuctionMarketMint = styled.p`
  margin: auto 0;
`;

export const StyledAuctionMarketMinBid = styled(StyledAuctionMarketMint)``;

export const StyledAuctionMarketCurrentBid = styled(StyledAuctionMarketMint)``;

export const StyledAuctionMarketSeller = styled(StyledAuctionMarketMint)``;

export const StyledAuctionMarketEndsIn = styled(StyledAuctionMarketMint)``;
