import { ReactNode, useState } from 'react';
import { AccordionToggleIcon } from '../../assets';
import {
  StyledAccordiomToggleIcon,
  StyledAccordionHeader,
  StyledAccordionTitle,
  StyledAccordionToggleButton,
  StyledAccordionWrapper,
} from './styles';

interface IProps {
  title: string;
  children: ReactNode;
  enableToggle: boolean;
}

export const Accordion: React.FC<IProps> = ({
  title,
  children,
  enableToggle,
}) => {
  const [expand, setExpand] = useState<boolean>(true);

  return (
    <StyledAccordionWrapper $expanded={expand}>
      <StyledAccordionHeader $expanded={expand}>
        <StyledAccordionTitle>{title}</StyledAccordionTitle>
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
