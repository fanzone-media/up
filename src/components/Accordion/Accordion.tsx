import { ReactNode, useState } from 'react';
import { AccordionToggleIcon } from '../../assets';
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
  const [expand, setExpand] = useState<boolean>(true);

  return (
    <StyledAccordionWrapper $expanded={expand}>
      <StyledAccordionHeader $expanded={expand}>
        {header}
        {enableToggle && (
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
