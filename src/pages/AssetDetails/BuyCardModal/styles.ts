import styled from 'styled-components';

export const StyledBuyCardModalContent = styled.div`
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

export const StyledInfoText = styled.p`
  font-size: 0.9rem;
`;

export const StyledButtonGroup = styled.div``;

export const StyledBuyButton = styled.button`
  background-color: rgba(255, 129, 1, 1);
  border-radius: 0.2em;
  color: white;
  width: 100%;
  padding: 0.5em 0;
`;

export const StyledCancelButton = styled(StyledBuyButton)`
  background-color: rgba(76, 76, 76, 1);
  margin-top: 0.8em;
`;
