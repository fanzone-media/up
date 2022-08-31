import detectEthereumProvider from '@metamask/detect-provider';
import React, { ReactText, useRef, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAccount, useConnect } from 'wagmi';
import {
  CloseMenuIcon,
  hamburgerIcon,
  Logo,
  UserIcon,
  WalletIcon,
} from '../../assets';
import { theme } from '../../boot/styles';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import {
  StyledButtonConainer,
  StyledButtonIcon,
  StyledButtonText,
  StyledConnectMetaMask,
  StyledHamburgerMenu,
  StyledHamburgerMenuButton,
  StyledHamburgerMenuContent,
  StyledHeader,
  StyledHeaderContent,
  StyledHmamburgerMenuIcon,
  StyledLink,
  StyledLogo,
  StyledMyUpLink,
  StyledSignUpLink,
} from './styles';

type HeaderContentType = {
  isConnected: boolean;
  isConnecting: boolean;
  connectMetamask: () => void;
  myUpLink?: string;
};

export const Header: React.FC = () => {
  const isTablet = useMediaQuery(theme.screen.md);
  const [{ data, loading }, connect] = useConnect();
  const [{}, disconnect] = useAccount();
  const [showAccountDetail, setShowAccountDetail] = useState<boolean>(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState<boolean>(false);
  const { getItems } = useLocalStorage();

  const upAddressLink = () => {
    const permissions = getItems('polygon');
    return permissions
      ? `/polygon/profile/${Object.keys(permissions)[0]}`
      : undefined;
  };

  const accountDetailsRef = useRef(null);
  const connectToastRef = useRef<ReactText>();

  useOutsideClick(
    accountDetailsRef,
    () => showAccountDetail && setShowAccountDetail(false),
  );

  const handleConnect = async () => {
    const connectToast = () =>
      (connectToastRef.current = toast('Connecting', {
        type: 'default',
        position: 'top-center',
      }));

    if (data.connected) {
      disconnect();
    } else {
      connectToast();
      const provider = await detectEthereumProvider();
      if (provider) {
        console.log('connect');
        connect(data.connectors[0])
          .then(() => {
            toast('Connected', {
              type: 'success',
              position: 'top-center',
              autoClose: 2000,
            });
          })
          .finally(() => {
            toast.dismiss(connectToastRef.current);
          });
      } else {
        toast.dismiss(connectToastRef.current);
        toast('Please install metamask', {
          type: 'error',
          position: 'top-center',
        });
      }
    }
  };

  return (
    <>
      <Router>
        <StyledHeader $showHamburger={showHamburgerMenu} id="header">
          {!isTablet && showHamburgerMenu && (
            <StyledHamburgerMenu>
              <StyledHamburgerMenuContent>
                <HeaderContent
                  isConnected={data.connected}
                  connectMetamask={handleConnect}
                  isConnecting={loading ? loading : false}
                  myUpLink={upAddressLink()}
                />
              </StyledHamburgerMenuContent>
            </StyledHamburgerMenu>
          )}
          <StyledHeaderContent>
            <StyledLink to="/">
              <StyledLogo src={Logo} alt="" />
            </StyledLink>
            {isTablet && (
              <HeaderContent
                isConnected={data.connected}
                connectMetamask={handleConnect}
                isConnecting={loading ? loading : false}
                myUpLink={upAddressLink()}
              />
            )}
            {!isTablet && (
              <StyledHamburgerMenuButton
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              >
                <StyledHmamburgerMenuIcon
                  src={showHamburgerMenu ? CloseMenuIcon : hamburgerIcon}
                />
              </StyledHamburgerMenuButton>
            )}
            {/* {showAccountDetail && data.connected && (
              <AccountDetails ref={accountDetailsRef} />
            )} */}
          </StyledHeaderContent>
        </StyledHeader>
      </Router>
    </>
  );
};

const HeaderContent = ({
  isConnected,
  connectMetamask,
  myUpLink,
  isConnecting,
}: HeaderContentType) => (
  <>
    <StyledButtonConainer>
      {myUpLink && (
        <StyledMyUpLink to={myUpLink}>
          <StyledButtonIcon src={UserIcon} alt="" />
          <StyledButtonText>My UP</StyledButtonText>
        </StyledMyUpLink>
      )}

      <StyledConnectMetaMask
        disabled={isConnecting}
        onClick={() => {
          connectMetamask();
        }}
      >
        <StyledButtonIcon src={WalletIcon} alt="" />
        <StyledButtonText>
          {isConnected ? 'Disconnect wallet' : 'Connect wallet'}
        </StyledButtonText>
      </StyledConnectMetaMask>
      <StyledSignUpLink
        href="https://app.fanzone.io/login"
        target="_blank"
        rel="noreferrer"
      >
        {myUpLink ? 'Go to Fanzone App' : 'Sign up'}
      </StyledSignUpLink>
    </StyledButtonConainer>
  </>
);
