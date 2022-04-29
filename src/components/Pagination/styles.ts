import styled from 'styled-components';

export const StyledPaginationWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledPaginationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  padding: 1.25em 0 1.25em 0;
  column-gap: 1.25em;
  row-gap: 1.25em;
  grid-auto-flow: unset;
  justify-items: center;

  @media ${({ theme }) => theme.screen.md} {
    grid-template-columns: repeat(3, 1fr);
  }
  @media ${({ theme }) => theme.screen.lg} {
    grid-template-columns: repeat(4, 1fr);
  }
  @media ${({ theme }) => theme.screen.xl} {
    grid-template-columns: repeat(5, 1fr);
  }
`;

export const StyledPaginationGridElement = styled.div`
  width: 100%;
`;

export const StyledPaginationControls = styled.div`
  display: flex;
  column-gap: 1.875em;
  margin-right: auto;
  margin-left: auto;
  margin-top: 1.25em;
`;

export const StyledArrowButton = styled.button`
  padding: 0 8px 0 8px;
`;

export const StyledPageNumButton = styled.button<{ active?: boolean }>`
  padding: 2px 8px 2px 8px;
  background: ${({ active }) => (active ? '#BCBCBC' : '')};
  border-radius: 3px;
`;
