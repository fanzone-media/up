import styled from 'styled-components';

export const StyledAccordionWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 10px;
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
  border-bottom: 1px solid rgba(223, 223, 223, 0.2);
  height: 40px;

  @media ${({ theme }) => theme.screen.md} {
    border-bottom: ${({ $expanded }) =>
      $expanded ? '1px solid rgba(223, 223, 223, 0.2)' : 'none'};
  }
`;

export const StyledAccordionTitle = styled.h3`
  margin: auto 0;
`;

export const StyledAccordionToggleButton = styled.button`
  margin: auto 0 auto auto;
`;

export const StyledAccordiomToggleIcon = styled.img<{ $expanded: boolean }>`
  transform: ${({ $expanded }) =>
    $expanded ? 'rotate(0deg)' : 'rotate(180deg)'};
`;
