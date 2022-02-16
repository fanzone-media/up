import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { FanzoneHexagon, Logo } from '../../assets';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { md } from '../../utility';
import { AccountDetails } from './AccountDetails';
import {
  StyledConnectMetaMask,
  StyledDivider,
  StyledHeader,
  StyledHeaderContent,
  StyledHeading,
  StyledLink,
  StyledLogo,
  StyledMyAccountButton,
} from './styles';

export const Header: React.FC = () => {
  const isTablet = useMediaQuery(md);
  const [{data, error}, connect] = useConnect();
  const [showAccountDetail, setShowAccountDetail] = useState<boolean>(false);

  return (
    <StyledHeader id="header">
      <StyledHeaderContent>
        <Router>
          <StyledLink to="/">
            <StyledLogo src={isTablet ? Logo : FanzoneHexagon} alt="" />
            <StyledDivider></StyledDivider>
            <StyledHeading>Profiles</StyledHeading>
          </StyledLink>
        </Router>
        {data.connected ? 
          <StyledMyAccountButton onClick={() => setShowAccountDetail(!showAccountDetail)}>
            My Account
          </StyledMyAccountButton> :
          <StyledConnectMetaMask onClick={() => connect(data.connectors[0])}>
            Connect Metamask 
          </StyledConnectMetaMask>
        }
        {
          showAccountDetail && data.connected && 
            <AccountDetails />
        }
        {/* <StyledFanzoneAppLink
          href="https://app.fanzone.io"
          target="_blank"
          rel="noreferrer"
        >
          Back to FANZONE
        </StyledFanzoneAppLink> */}
      </StyledHeaderContent>
    </StyledHeader>
  );
};
