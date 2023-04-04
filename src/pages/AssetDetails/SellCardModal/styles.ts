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
  width: 100%;
`;

export const StyledTokenSelectorDropDown = styled.select`
  background: none;
`;

export const StyledErrorMessage = styled.p`
  color: red;
`;
