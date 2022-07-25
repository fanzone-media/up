import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { FanzoneHexagon } from '../../assets';
import {
  StyledFooterContent,
  StyledFooter,
  StyledFanzoneHexagon,
  StyledNetworkLink,
  StyledNetworksWrapper,
  StyledDivider,
  StyledNetworksText,
  StyledNetworks,
  StyledLabel,
} from './styles';

export const Footer: React.FC = () => {
  const networks = [
    { name: 'Lukso L16', link: '/l16' },
    { name: 'Lukso L14', link: '/l14' },
    { name: 'Polygon Mumbai', link: '/mumbai' },
    { name: 'Polygon Mainnet', link: '/polygon' },
    { name: 'Ethereum Mainnet', link: '/ethereum' },
  ];
  return (
    <StyledFooter>
      <StyledFooterContent>
        <StyledLabel>Powered by</StyledLabel>
        <StyledFanzoneHexagon src={FanzoneHexagon} alt="" />
        {/* <StyledLink href="https://lukso.network">Running on L14 Test Network</StyledLink>
        <StyledLukso src={Lukso} alt="" /> */}
        <StyledNetworksText>Choose a network: </StyledNetworksText>
        <Router>
          <StyledNetworksWrapper>
            <StyledDivider></StyledDivider>
            {networks.map((item) => (
              <StyledNetworks key={item.name}>
                <StyledNetworkLink to={item.link}>
                  {item.name}
                </StyledNetworkLink>
                <StyledDivider></StyledDivider>
              </StyledNetworks>
            ))}
          </StyledNetworksWrapper>
        </Router>
      </StyledFooterContent>
    </StyledFooter>
  );
};
