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
  display: flex;
  column-gap: 1em;
`;

export const StyledTokenSelectorDropDown = styled.select`
  background: none;
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
