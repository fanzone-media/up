import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const StyledFooter = styled.footer`
  display: flex;
  padding: 30px 0 30px 0;
  margin-top: auto;
`;

export const StyledFooterContent = styled.div`
  align-items: center;
  display: flex;
  color: white;
  text-align: center;
  margin: 0 auto 0 auto;
  position: relative;
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

export const StyledNetworksText = styled.p`
  cursor: pointer;
`;

export const StyledNetworksWrapper = styled.div`
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 200px;

  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  @media ${({ theme }) => theme.screen.md} {
    bottom: 0;
    left: 170px;
    transform: unset;
  }
`;

export const StyledNetworks = styled.div`
  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.screen.md} {
    flex-direction: row;
  }
`;

export const StyledDivider = styled.span`
  background-color: white;
  height: 20px;
  width: 2px;
  display: none;

  @media ${({ theme }) => theme.screen.md} {
    display: flex;
  }
`;

export const StyledNetworkLink = styled(Link)`
  padding: 5px;
  margin: auto 0 auto 0;
`;

export const StyledTrigger = styled.div`
  border-style: solid;
  border-width: 8px 8px 0 8px;
  border-color: #fff transparent transparent transparent;
  cursor: pointer;
  height: 0;
  margin-left: 10px;
  width: 0;
`;
