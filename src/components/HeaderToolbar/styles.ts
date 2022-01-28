import styled from 'styled-components';
import { md, sm } from '../../utility';

export const StyledHeaderToolbar = styled.div`
  width: 100%;
  background-color: rgba(33, 33, 33, 1);
  height: 54px;
  display: flex;

  @media ${sm} {
    height: 65px;
  }
`;

export const StyledHeaderToolbarContent = styled.div`
  width: 100%;
  padding: 0 8px 0 8px;
  display: flex;

  @media ${md} {
    max-width: 1440px;
    padding: 0 40px 0 40px;
    margin: 0 auto 0 auto;
  }
`;

export const StyledBackButton = styled.button`
  display: flex;
  width: max-content;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateX(-3px);
  }
`;

export const StyledButtonLabel = styled.p`
  font-size: 17px;
  margin: auto 0 auto 10px;
`;

export const StyledBackImg = styled.img`
  width: 16px;
  height: 16px;
  margin: auto 0 auto 0;
`;

export const StyledHeaderToolbarLabel = styled.h1`
  font-size: 24px;
  margin: auto 0 auto auto;
`;
