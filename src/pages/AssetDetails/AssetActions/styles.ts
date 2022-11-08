import styled from 'styled-components';

export const StyledActionsButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  @media ${({ theme }) => theme.screen.md} {
    flex-direction: row;
    column-gap: 10px;
  }
`;

export const StyledCardPriceValue = styled.p`
  margin: auto 0;
`;

export const StyledCardPriceValueWrapper = styled.div`
  display: flex;
`;

export const StyledBuyButton = styled.button`
  width: 100%;
  background: rgba(255, 129, 1, 1);
  border-radius: 5px;
  padding: 7px 0;
`;

export const StyledSetPriceButton = styled(StyledBuyButton)`
  background: rgba(255, 255, 255, 0.2);
`;

export const StyledChangePriceButton = styled(StyledSetPriceButton)``;

export const StyledSetForAuctionButton = styled(StyledSetPriceButton)``;

export const StyledWithdrawButton = styled(StyledSetPriceButton)``;
