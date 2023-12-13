import React, { useRef, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { CloseMenuIcon, hamburgerIcon, Logo } from '../../assets';
import { theme } from '../../boot/styles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { HeaderContent } from './HeaderContent';
import {
  StyledDownloadLink,
  StyledHamburgerMenu,
  StyledHamburgerMenuButton,
  StyledHamburgerMenuContent,
  StyledHeader,
  StyledHeaderContent,
  StyledHmamburgerMenuIcon,
  StyledLink,
  StyledLogo,
  StyledNotice,
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
          <StyledNotice>
            <p>
              Notice: The Fanzone App is no longer active. However, there is
              good news! If you have activated your Universal Profile in the
              Fanzone App, you can still visit your profile and your card
              collection any time on this page, Fanzone.cloud!
            </p>

            <p>
              If you don’t know the link to your Universal Profile, you can
              click{' '}
              <StyledDownloadLink href="./assets/accountListCSV.csv" download>
                [here]
              </StyledDownloadLink>{' '}
              to download a sheet with all of the links (you can cmd+f search
              for your username). Don’t worry, only you have the ability to
              modify your profile through the link.
            </p>
            <p>
              Once in your profile, you can continue to view, trade and export
              your cards to your wallet. If for any reason Fanzone.cloud stops
              working, a team will try to fix it as soon as possible.
              Fanzone.cloud will continue to be active, and your cards belong to
              you, so you can keep your cards here, or transfer them to your
              wallet any time!
            </p>
          </StyledNotice>
        </StyledHeader>
      </Router>
    </>
  );
};
