import styled from 'styled-components';

export const StyledSellCardModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  row-gap: 2em;
`;

export const StyledModalHeader = styled.h3`
  text-align: center;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: 1.2rem;
`;

export const StyledInputGroup = styled.div`
  position: relative;
`;

export const StyledPriceLabel = styled.p`
  position: absolute;
  padding: 0 0.5em;
  margin: -0.75em 0 0 0.5em;
  background-color: rgba(49, 49, 49, 1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

export const StyledPriceInput = styled.input`
  background: transparent;
  color: white;
  border: 1px solid rgba(153, 153, 153, 1);
  border-radius: 0.3em;
  padding: 0.5em 0.5em;
  text-align: end;
  width: 100%;
`;

export const StyledButtonGroup = styled.div``;

export const StyledSetPriceButton = styled.button`
  background-color: rgba(255, 129, 1, 1);
  border-radius: 0.2em;
  color: white;
  width: 100%;
  padding: 0.5em 0;
`;

export const StyledCancelButton = styled(StyledSetPriceButton)`
  background-color: rgba(76, 76, 76, 1);
  margin-top: 0.8em;
`;
