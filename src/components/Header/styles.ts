import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const StyledHeader = styled.header<{ $showHamburger: boolean }>`
  background-color: black;
  display: flex;
  flex-direction: column;
  // height: 54px;
  color: white;
  border-bottom: 1px solid #858585;
  position: ${({ $showHamburger }) => ($showHamburger ? 'fixed' : 'relative')};
  width: 100%;
  z-index: 10;

  @media ${({ theme }) => theme.screen.sm} {
    // height: 65px;
  }
`;

export const StyledHeaderContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 8px 8px;
  border-bottom: 1px solid white;

  @media ${({ theme }) => theme.screen.md} {
    display: grid;
    max-width: 1440px;
    margin: 0 auto;
    padding: 10px 40px;
    grid-template-columns: 1fr 1fr;
  }
`;

export const StyledNotice = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  text-align: justify;
  padding: 8px 8px;

  @media ${({ theme }) => theme.screen.md} {
    max-width: 1440px;
    margin: 0 auto;
    padding: 8px 40px;
  }
`;

export const StyledDownloadLink = styled.a`
  color: blue;
`;

export const StyledHamburgerMenu = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 54px;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background-color: black;
  z-index: 9999;
`;

export const StyledHamburgerMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 2em;
  row-gap: 20px;
`;

export const StyledHamburgerMenuButton = styled.button`
  margin-left: auto;
`;

export const StyledHmamburgerMenuIcon = styled.img``;

export const StyledHamburgerMenuCloseButton = styled.button`
  margin-left: auto;
`;

export const StyledHmamburgerMenuCloseIcon = styled.img``;

export const StyledLink = styled(Link)`
  margin: auto 0;
`;

export const StyledLogo = styled.img`
  height: 40px;
`;

export const StyledFanzoneAppLink = styled.a`
  margin: 0 auto;

  @media ${({ theme }) => theme.screen.md} {
    margin: auto 0 auto auto;
  }
`;

export const StyledOurNftLink = styled.a`
  margin: 0 auto;

  @media ${({ theme }) => theme.screen.md} {
    margin: auto auto auto 0;
  }
`;
