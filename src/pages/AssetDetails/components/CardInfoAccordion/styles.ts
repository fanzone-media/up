import styled from 'styled-components';
import { Accordion } from '../../../../components';

export const StyledCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  row-gap: 1em;
`;
export const StyledCardInfoAccordion = styled(Accordion)``;

export const StyledCardInfoContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const StyledCardInfoLabel = styled.p`
  color: white;
  opacity: 0.5;
  width: 50%;
`;

export const StyledCardInfoValue = styled.p`
  width: 50%;
`;

export const StyledCardStandardLabel = styled.p`
  margin-left: auto;
`;
