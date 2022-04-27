import styled from 'styled-components';

export const StyledDesktopCreatorsAccordionWrapper = styled.div<{
  $expanded: boolean;
}>`
  display: flex;
  height: ${({ $expanded }) => ($expanded ? '100%' : '62px')};
  overflow: hidden;

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

export const StyledCreatorsContainer = styled.div<{ $expanded: boolean }>`
  width: 100%;
  padding: 0.5em 1em;
`;

export const StyledIssuerContainer = styled.div<{ $expanded: boolean }>`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 26.97%,
    rgba(255, 255, 255, -0.06) 100%
  );
  margin-left: auto;
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

export const StyledAccordionToggleButton = styled.button`
  margin: auto 0 auto auto;
`;

export const StyledAccordiomToggleIcon = styled.img<{ $expanded: boolean }>`
  transform: ${({ $expanded }) =>
    $expanded ? 'rotate(0deg)' : 'rotate(180deg)'};
`;
