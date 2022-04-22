import styled from 'styled-components';

export const HideOnScreen = styled.div<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  @media ${({ theme, size }) => theme.screen[size]} {
    display: none;
  }
`;
