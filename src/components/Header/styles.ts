import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { md, sm } from '../../utility';

export const StyledHeader = styled.header`
  background-color: black;
  display: flex;
  height: 54px;
  color: white;
  border-bottom: 1px solid #858585;

  @media ${sm} {
    height: 65px;
  }
`;

export const StyledHeaderContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;
  height: 100%;
  padding: 0 8px;

  @media ${md} {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 40px;
  }
`;

export const StyledLink = styled(Link)`
  margin: auto 0;
`;

export const StyledLogo = styled.img`
  height: 40px;
`;

export const StyledFanzoneAppLink = styled.a`
  margin: auto 0 auto auto;
`;

export const StyledOurNftLink = styled.a`
  margin: auto auto auto 0;
`;

export const StyledButtonConainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  column-gap: 20px;
`;

export const StyledSignUpLink = styled.a`
  margin: auto 0 auto auto;
  width: 150px;
  height: 35px;
  text-align: center;
  line-height: 35px;
  vertical-align: middle;
  background: linear-gradient(180deg, #ff9b00 0%, #ff5c00 100%);
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.15);
  border-radius: 3px;
`;

export const StyledConnectMetaMask = styled.button`
  height: 35px;
  width: 150px;
  border: 1px solid white;
  margin: auto 0;
  box-sizing: border-box;
  filter: drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.15));
  border-radius: 3px;
`;

export const StyledMyAccountButton = styled(StyledConnectMetaMask)``;
