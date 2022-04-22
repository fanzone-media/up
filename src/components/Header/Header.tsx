import React, { useRef, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { useConnect } from 'wagmi';
import { FanzoneHexagon, hamburgerIcon, Logo } from '../../assets';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { md } from '../../utility';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { AccountDetails } from './AccountDetails';
import {
  StyledButtonConainer,
  StyledConnectMetaMask,
  StyledFanzoneAppLink,
  StyledHamburgerMenu,
  StyledHamburgerMenuButton,
  StyledHamburgerMenuCloseButton,
  StyledHamburgerMenuContent,
  StyledHeader,
  StyledHeaderContent,
  StyledHmamburgerMenuIcon,
  StyledLink,
  StyledLogo,
  StyledMyAccountButton,
  StyledOurNftLink,
  StyledSignUpLink,
} from './styles';

type HeaderContentType = {
  isConnected: boolean;
  connectMetamask: () => void;
  showAccountDetails: () => void;
};

export const Header: React.FC = () => {
  const isTablet = useMediaQuery(md);
  const [{ data }, connect] = useConnect();
  const [showAccountDetail, setShowAccountDetail] = useState<boolean>(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState<boolean>(false);

  const accountDetailsRef = useRef(null);
  useOutsideClick(
    accountDetailsRef,
    () => showAccountDetail && setShowAccountDetail(false),
  );

  return (
    <StyledHeader id="header">
      {!isTablet && showHamburgerMenu && (
        <StyledHamburgerMenu>
          <StyledHamburgerMenuCloseButton
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
          >
            Close Menu
          </StyledHamburgerMenuCloseButton>
          <StyledHamburgerMenuContent>
            <HeaderContent
              isConnected={data.connected}
              connectMetamask={() => connect(data.connectors[0])}
              showAccountDetails={() =>
                setShowAccountDetail(!showAccountDetail)
              }
            />
          </StyledHamburgerMenuContent>
        </StyledHamburgerMenu>
      )}
      <StyledHeaderContent>
        <Router>
          <StyledLink to="/">
            <StyledLogo src={isTablet ? Logo : FanzoneHexagon} alt="" />
          </StyledLink>
        </Router>
        {/* <StyledButtonConainer>
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
        </StyledButtonConainer> */}
        {isTablet && (
          <HeaderContent
            isConnected={data.connected}
            connectMetamask={() => connect(data.connectors[0])}
            showAccountDetails={() => setShowAccountDetail(!showAccountDetail)}
          />
        )}
        {!isTablet && (
          <StyledHamburgerMenuButton
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
          >
            <StyledHmamburgerMenuIcon src={hamburgerIcon} />
          </StyledHamburgerMenuButton>
        )}
        {showAccountDetail && data.connected && (
          <AccountDetails ref={accountDetailsRef} />
        )}
      </StyledHeaderContent>
    </StyledHeader>
  );
};

const HeaderContent = ({
  isConnected,
  connectMetamask,
  showAccountDetails,
}: HeaderContentType) => (
  <>
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
      {isConnected ? (
        <StyledMyAccountButton onClick={showAccountDetails}>
          My Account
        </StyledMyAccountButton>
      ) : (
        <StyledConnectMetaMask onClick={connectMetamask}>
          Connect wallet
        </StyledConnectMetaMask>
      )}
    </StyledButtonConainer>
  </>
);
