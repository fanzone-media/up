import { ReactNode, useState } from 'react';
import { AccordionToggleIcon } from '../../assets';
import { theme } from '../../boot/styles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  StyledAccordiomToggleIcon,
  StyledAccordionHeader,
  StyledAccordionToggleButton,
  StyledAccordionWrapper,
} from './styles';

interface IProps {
  header: ReactNode;
  children: ReactNode;
  enableToggle: boolean;
}

export const Accordion: React.FC<IProps> = ({
  header,
  children,
  enableToggle,
}) => {
  const isDesktop = useMediaQuery(theme.screen.md);
  const [expand, setExpand] = useState<boolean>(true);

  return (
    <StyledAccordionWrapper $expanded={expand}>
      <StyledAccordionHeader $expanded={expand}>
        {header}
        {enableToggle && !isDesktop && (
          <StyledAccordionToggleButton onClick={() => setExpand(!expand)}>
            <StyledAccordiomToggleIcon
              $expanded={expand}
              src={AccordionToggleIcon}
              alt=""
            />
          </StyledAccordionToggleButton>
        )}
      </StyledAccordionHeader>
      {expand && children}
    </StyledAccordionWrapper>
  );
};
