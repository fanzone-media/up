import styled from 'styled-components';

export const StyledHolderPagination = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`;

export const StyledHolderPaginationGridContainer = styled.div`
  display: grid;
  padding: 15px 0;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  row-gap: 20px;

  @media ${({ theme }) => theme.screen.sm} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${({ theme }) => theme.screen.md} {
    grid-template-columns: repeat(4, 1fr);
  }

  @media ${({ theme }) => theme.screen.lg} {
    grid-template-columns: repeat(4, 1fr);
  }

  @media ${({ theme }) => theme.screen.xl} {
    grid-template-columns: repeat(5, 1fr);
  }
`;
