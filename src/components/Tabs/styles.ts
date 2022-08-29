import styled from 'styled-components';

export const StyledTabs = styled.div``;

export const StyledTabsHeader = styled.div`
  display: flex;
  column-gap: 1.5em;
`;

export const StyledTabsLabel = styled.button<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? 'white' : 'rgba(223, 223, 223, 0.3)')};
`;
