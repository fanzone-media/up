import React, { useRef, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { CloseMenuIcon, hamburgerIcon, Logo } from '../../assets';
import { theme } from '../../boot/styles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { HeaderContent } from './HeaderContent';
import {
  StyledHamburgerMenu,
  StyledHamburgerMenuButton,
  StyledHamburgerMenuContent,
  StyledHeader,
  StyledHeaderContent,
  StyledHmamburgerMenuIcon,
  StyledLink,
  StyledLogo,
} from './styles';

export const Header: React.FC = () => {
  const isTablet = useMediaQuery(theme.screen.md);
  const [showAccountDetail, setShowAccountDetail] = useState<boolean>(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState<boolean>(false);

  const accountDetailsRef = useRef(null);

  useOutsideClick(
    accountDetailsRef,
    () => showAccountDetail && setShowAccountDetail(false),
  );

  return (
    <>
      <Router>
        <StyledHeader $showHamburger={showHamburgerMenu} id="header">
          {!isTablet && showHamburgerMenu && (
            <StyledHamburgerMenu>
              <StyledHamburgerMenuContent>
                <HeaderContent />
              </StyledHamburgerMenuContent>
            </StyledHamburgerMenu>
          )}
          <StyledHeaderContent>
            <StyledLink to="/">
              <StyledLogo src={Logo} alt="" />
            </StyledLink>
            {isTablet && <HeaderContent />}
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
