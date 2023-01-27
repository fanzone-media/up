import styled from 'styled-components';
import {
  StyledEmbedMarketContent,
  StyledEmbedMarketWrapper,
  StyledReloadMarketButton,
} from '../EmbedMarket/styles';

export const StyledEmbedAuctionMarketContent = styled(
  StyledEmbedMarketContent,
)``;

export const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.5em;

  @media (min-width: 1200px) {
    flex-direction: row;
    column-gap: 0.5em;
  }
`;

export const StyledReloadAuctionMarketButton = styled(StyledReloadMarketButton)`
  margin-top: 0;
`;

export const StyledEmbedAuctionMarketWrapper = styled(
  StyledEmbedMarketWrapper,
)``;
