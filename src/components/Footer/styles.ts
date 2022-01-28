import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { HashRouter as Router } from 'react-router-dom';
import { md } from '../../utility';

export const StyledFooter = styled.footer`
  display: flex;
  padding: 30px 0 30px 0;
  margin-top: auto;
`;

export const StyledFooterContent = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;
  margin: 0 auto 0 auto;
  row-gap: 10px;
`;

export const StyledLabel = styled.p``;

export const StyledFanzoneHexagon = styled.img`
  width: 40px;
  margin: 0 auto 0 auto;
`;

export const StyledLukso = styled.img`
  margin: 0 auto 0 auto;
`;

export const StyledLink = styled.a``;

export const StyledNetworksText = styled.p``;

export const StyledNetworksWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media ${md} {
    flex-direction: row;
  }
`;

export const StyledNetworks = styled.div`
  display: flex;
  flex-direction: column;

  @media ${md} {
    flex-direction: row;
  }
`;

export const StyledDivider = styled.span`
  background-color: white;
  height: 20px;
  width: 2px;
  display: none;

  @media ${md} {
    display: flex;
  }
`;

export const StyledNetworkLink = styled(Link)`
  padding: 0 5px 0 5px;
  margin: auto 0 auto 0;
`;
