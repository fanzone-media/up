import styled from 'styled-components';

export const StyledCardMarketContainer = styled.div`
  padding: 2em 0;
  display: flex;
`;

export const StyledCardMarketTable = styled.div`
  width: 100%;
`;

export const StyledCardMarketListHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5em;
  border-radius: 0.5em;
  margin-bottom: 1.5em;
`;

export const StyledCardMarketListHeaderContent = styled.h4``;

export const StyledCardMarket = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

export const StyledCardMarketMint = styled.p`
  margin: auto 0;
`;

export const StyledCardMarketPrice = styled.p`
  margin: auto 0;
`;

export const StyledCardMarketBuy = styled.button`
  background-color: rgba(255, 129, 1, 1);
  border-radius: 0.3em;
  padding: 0.3em 0;
`;
