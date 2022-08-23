import { ReactNode, useState } from 'react';
import {
  StyledAccordionHeader,
  StyledCreatorsContainer,
  StyledDesktopCreatorsAccordionWrapper,
  StyledHeader,
  StyledHeaderTitle,
  StyledIssuerContainer,
  StyledIssuerOwnerWrapper,
  StyledOwnerContainer,
} from './styles';

interface IProps {
  creatorsContent: ReactNode;
  issuerContent: ReactNode;
  ownerContent?: ReactNode;
}

export const DesktopCreatorsAccordion: React.FC<IProps> = ({
  creatorsContent,
  issuerContent,
  ownerContent,
}) => {
  const [expand, setExpand] = useState<boolean>(true);

  return (
    <StyledDesktopCreatorsAccordionWrapper>
      <StyledIssuerOwnerWrapper>
        <StyledIssuerContainer $expanded={expand}>
          <StyledHeader $expanded={expand}>
            <StyledHeaderTitle>Issuer</StyledHeaderTitle>
          </StyledHeader>
          {issuerContent}
        </StyledIssuerContainer>
        {ownerContent && (
          <StyledOwnerContainer>
            <StyledHeader $expanded={expand}>
              <StyledHeaderTitle>Owner</StyledHeaderTitle>
            </StyledHeader>
            {ownerContent}
          </StyledOwnerContainer>
        )}
      </StyledIssuerOwnerWrapper>

      <StyledCreatorsContainer $expanded={expand}>
        <StyledHeader $expanded={expand}>
          <StyledHeaderTitle>Creators</StyledHeaderTitle>
        </StyledHeader>
        {creatorsContent}
      </StyledCreatorsContainer>

      <StyledAccordionHeader $expanded={expand}></StyledAccordionHeader>
    </StyledDesktopCreatorsAccordionWrapper>
  );
};
