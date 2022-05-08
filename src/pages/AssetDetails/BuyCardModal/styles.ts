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

export const StyledToggleButtonGroup = styled.div`
  border-radius: 0.5em;
  width: max-content;
  border: 1px solid rgba(153, 153, 153, 1);
  margin: 0 auto;

  button {
    border-right: 1px solid rgba(153, 153, 153, 1);

    :first-child {
      border-radius: 0.4em 0 0 0.4em;
    }

    :last-child {
      border-right: none;
      border-radius: 0 0.4em 0.4em 0;
    }
  }
`;

export const StyledToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.5em;
  color: ${({ $active }) => ($active ? 'rgba(255, 129, 1, 1)' : 'white')};
  background-color: ${({ $active }) =>
    $active ? 'rgba(255, 255, 255, 0.2)' : ''};
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

export const StyledApproveButton = styled(StyledCancelButton)``;
