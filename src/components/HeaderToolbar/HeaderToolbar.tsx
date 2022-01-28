import React from 'react';
import { PrevIcon } from '../../assets';
import {
  StyledBackButton,
  StyledBackImg,
  StyledButtonLabel,
  StyledHeaderToolbar,
  StyledHeaderToolbarContent,
  StyledHeaderToolbarLabel,
} from './styles';

interface IProps {
  onBack: () => void;
  buttonLabel: string;
  headerToolbarLabel: string;
}

export const HeaderToolbar: React.FC<IProps> = ({
  onBack,
  buttonLabel,
  headerToolbarLabel,
}: IProps) => {
  return (
    <StyledHeaderToolbar>
      <StyledHeaderToolbarContent>
        <StyledBackButton onClick={onBack}>
          <StyledBackImg src={PrevIcon} />
          <StyledButtonLabel>{buttonLabel}</StyledButtonLabel>
        </StyledBackButton>
        <StyledHeaderToolbarLabel>
          {headerToolbarLabel}
        </StyledHeaderToolbarLabel>
      </StyledHeaderToolbarContent>
    </StyledHeaderToolbar>
  );
};
