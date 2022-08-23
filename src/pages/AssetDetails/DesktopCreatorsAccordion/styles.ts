import styled from 'styled-components';

export const StyledDesktopCreatorsAccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.screen.md} {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.08) 107.79%
      ),
      rgba(33, 33, 33, 0.6);
  }
`;

export const StyledAccordionHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  height: 40px;

  @media ${({ theme }) => theme.screen.md} {
    border-bottom: ${({ $expanded }) =>
      $expanded ? '1px solid rgba(223, 223, 223, 0.2)' : 'none'};
  }
`;

export const StyledIssuerOwnerWrapper = styled.div`
  display: flex;
`;

export const StyledCreatorsContainer = styled.div<{ $expanded: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5em 1em;
`;

export const StyledIssuerContainer = styled.div<{ $expanded: boolean }>`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 26.97%,
    rgba(255, 255, 255, -0.06) 100%
  );
  padding: 0.5em 1em;
`;

export const StyledOwnerContainer = styled.div`
  padding: 0.5em 1em;
`;

export const StyledHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  height: 2.5em;
  border-bottom: ${({ $expanded }) =>
    $expanded ? '1px solid rgba(223, 223, 223, 0.2)' : 'none'};
`;

export const StyledHeaderTitle = styled.h3`
  margin: auto 0;
`;

export const StyledCreatorsContent = styled.div``;
