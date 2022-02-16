import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { md, sm } from '../../utility';

export const StyledHeader = styled.header`
  background-color: black;
  display: flex;
  height: 54px;
  color: white;

  @media ${sm} {
    height: 65px;
  }
`;

export const StyledHeaderContent = styled.div`
  display: flex;
  width: 100%;
  padding: 0 8px 0 8px;

  @media ${md} {
    max-width: 1440px;
    margin: 0 auto 0 auto;
    padding: 0 40px 0 40px;
  }
`;

export const StyledLink = styled(Link)`
  display: flex;
  padding: 10px 0 10px 0;
`;

export const StyledLogo = styled.img`
  height: 100%;
  margin: auto 0 auto 0;
`;

export const StyledDivider = styled.span`
  border: 1px solid white;
  margin: 0 10px 0 10px;
`;

export const StyledHeading = styled.h2`
  margin: auto 0 auto 0;
  font-size: 18px;
`;

export const StyledFanzoneAppLink = styled.a`
  border: 1px solid white;
  margin: auto 0 auto auto;
  padding: 2px 10px 2px 10px;
  border-radius: 5px;
  width: auto;
`;

export const StyledConnectMetaMask = styled.button`
  margin: auto 0 auto auto;
`;

export const StyledMyAccountButton = styled(StyledConnectMetaMask)`

`;