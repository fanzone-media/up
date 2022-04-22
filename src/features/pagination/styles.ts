import styled from 'styled-components';

export const StyledPaginationWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledAssetsHeader = styled.div`
  padding-top: 20px;
  display: flex;
  text-transform: capitalize;
`;

export const StyledAssetsHeading = styled.h1`
  font-size: 24px;
  font-weight: ${({ theme }) => theme.font.weight.bolder};
  margin-right: auto;
`;

export const StyledAssetsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  padding: 20px 0 20px 0;
  column-gap: 20px;
  row-gap: 20px;
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

export const StyledPaginationControls = styled.div`
  display: flex;
  column-gap: 30px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 20px;
`;

export const StyledNextButton = styled.button`
  padding: 0 8px 0 8px;
`;

export const StyledPreviousButton = styled(StyledNextButton)``;

export const StyledNextIcon = styled.img``;

export const StyledPrevIcon = styled.img``;

export const StyledPageNumButton = styled.button<{ active?: boolean }>`
  padding: 2px 8px 2px 8px;
  background: ${({ active }) => (active ? '#BCBCBC' : '')};
  border-radius: 3px;
`;
