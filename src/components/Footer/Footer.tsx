import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import {
  StyledFooterContent,
  StyledFooter,
  StyledNetworkLink,
  StyledNetworksWrapper,
  StyledNetworksText,
  StyledNetworks,
  StyledTrigger,
} from './styles';

export const Footer: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const onClick = () => setShowDropdown(!showDropdown);
  const onClickLink = () => setShowDropdown(false);

  const networks = [
    { name: 'Lukso L16', link: '/up/l16' },
    { name: 'Lukso L14', link: '/up//l14' },
    { name: 'Polygon Mumbai', link: '/up//mumbai' },
    { name: 'Polygon Mainnet', link: '/up//polygon' },
    { name: 'Ethereum Mainnet', link: '/up//ethereum' },
  ];
  return (
    <StyledFooter>
      <StyledFooterContent>
        <StyledNetworksText onClick={onClick}>
          Choose a network
        </StyledNetworksText>
        <StyledTrigger onClick={onClick} />
        <Router>
          {showDropdown && (
            <StyledNetworksWrapper>
              {networks.map((item) => (
                <StyledNetworks key={item.name}>
                  <StyledNetworkLink to={item.link} onClick={onClickLink}>
                    {item.name}
                  </StyledNetworkLink>
                </StyledNetworks>
              ))}
            </StyledNetworksWrapper>
          )}
        </Router>
      </StyledFooterContent>
    </StyledFooter>
  );
};
