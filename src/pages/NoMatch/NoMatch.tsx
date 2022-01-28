import React from 'react';
import { StyledError, StyledNoMatch, StyledNoMatchContent } from './styles';

const NoMatch: React.FC = () => {
  return (
    <StyledNoMatch>
      <StyledNoMatchContent>
        <StyledError>404</StyledError>
        <StyledError>NOT FOUND</StyledError>
      </StyledNoMatchContent>
    </StyledNoMatch>
  );
};

export default NoMatch;
