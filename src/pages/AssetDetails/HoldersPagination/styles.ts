import styled from 'styled-components';
import { lg, md, sm, xl } from '../../../utility';

export const StyledHolderPagination = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`;

export const StyledHolderPaginationGridContainer = styled.div`
  display: grid;
  padding: 15px 0;

  @media ${sm} {
    grid-template-columns: 2;
  }

  @media ${md} {
    grid-template-columns: 3;
  }

  @media ${lg} {
    grid-template-columns: 4;
  }

  @media ${xl} {
    grid-template-columns: 5;
  }
`;
