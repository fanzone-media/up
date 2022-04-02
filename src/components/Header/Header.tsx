import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import { FanzoneHexagon, Logo } from '../../assets';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { md } from '../../utility';
import { AccountDetails } from './AccountDetails';
import {
  StyledButtonConainer,
  StyledConnectMetaMask,
  StyledFanzoneAppLink,
  StyledHeader,
  StyledHeaderContent,
  StyledLink,
  StyledLogo,
  StyledMyAccountButton,
  StyledOurNftLink,
  StyledSignUpLink,
} from './styles';

export const Header: React.FC = () => {
  const isTablet = useMediaQuery(md);
  const [{ data, error }, connect] = useConnect();
  const [showAccountDetail, setShowAccountDetail] = useState<boolean>(false);

  return (
    <StyledHeader id="header">
      <StyledHeaderContent>
        <Router>
          <StyledLink to="/">
            <StyledLogo src={isTablet ? Logo : FanzoneHexagon} alt="" />
          </StyledLink>
        </Router>
        <StyledButtonConainer>
          <StyledFanzoneAppLink
            href="https://app.fanzone.io"
            target="_blank"
            rel="noreferrer"
          >
            Back to FANZONE App
          </StyledFanzoneAppLink>
          <StyledOurNftLink
            href="https://www.notion.so/fanzoneio/About-NFTs-Web3-by-FANZONE-io-6d1e615991c34bcabb03b7005222c918"
            target="_blank"
            rel="noreferrer"
          >
            Our NFTs
          </StyledOurNftLink>
        </StyledButtonConainer>
        <StyledButtonConainer>
          <StyledSignUpLink
            href="https://app.fanzone.io/login"
            target="_blank"
            rel="noreferrer"
          >
            Signup
          </StyledSignUpLink>
          {data.connected ? (
            <StyledMyAccountButton
              onClick={() => setShowAccountDetail(!showAccountDetail)}
            >
              My Account
            </StyledMyAccountButton>
          ) : (
            <StyledConnectMetaMask onClick={() => connect(data.connectors[0])}>
              Connect wallet
            </StyledConnectMetaMask>
          )}
        </StyledButtonConainer>
        {showAccountDetail && data.connected && <AccountDetails />}
      </StyledHeaderContent>
    </StyledHeader>
  );
};
