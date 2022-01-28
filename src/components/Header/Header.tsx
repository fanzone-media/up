import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { FanzoneHexagon, Logo } from '../../assets';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { md } from '../../utility';
import {
  StyledDivider,
  StyledFanzoneAppLink,
  StyledHeader,
  StyledHeaderContent,
  StyledHeading,
  StyledLink,
  StyledLogo,
} from './styles';

export const Header: React.FC = () => {
  const isTablet = useMediaQuery(md);

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
        <StyledFanzoneAppLink
          href="https://app.fanzone.io"
          target="_blank"
          rel="noreferrer"
        >
          Back to FANZONE
        </StyledFanzoneAppLink>
      </StyledHeaderContent>
    </StyledHeader>
  );
};
