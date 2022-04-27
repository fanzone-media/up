import { ReactNode, useState } from 'react';
import { AccordionToggleIcon } from '../../../assets';
import {
  StyledAccordiomToggleIcon,
  StyledAccordionHeader,
  StyledAccordionToggleButton,
  StyledCreatorsContainer,
  StyledDesktopCreatorsAccordionWrapper,
  StyledHeader,
  StyledHeaderTitle,
  StyledIssuerContainer,
} from './styles';

interface IProps {
  creatorsContent: ReactNode;
  issuerContent: ReactNode;
  enableToggle: boolean;
}

export const DesktopCreatorsAccordion: React.FC<IProps> = ({
  creatorsContent,
  issuerContent,
  enableToggle,
}) => {
  const [expand, setExpand] = useState<boolean>(true);

  return (
    <StyledDesktopCreatorsAccordionWrapper $expanded={expand}>
      <StyledCreatorsContainer $expanded={expand}>
        <StyledHeader $expanded={expand}>
          <StyledHeaderTitle>Creators</StyledHeaderTitle>
        </StyledHeader>
        {creatorsContent}
      </StyledCreatorsContainer>
      <StyledIssuerContainer $expanded={expand}>
        <StyledHeader $expanded={expand}>
          <StyledHeaderTitle>Issuer</StyledHeaderTitle>
          {enableToggle && (
            <StyledAccordionToggleButton onClick={() => setExpand(!expand)}>
              <StyledAccordiomToggleIcon
                $expanded={expand}
                src={AccordionToggleIcon}
                alt=""
              />
            </StyledAccordionToggleButton>
          )}
        </StyledHeader>
        {issuerContent}
      </StyledIssuerContainer>
      <StyledAccordionHeader $expanded={expand}></StyledAccordionHeader>
    </StyledDesktopCreatorsAccordionWrapper>
  );
};
