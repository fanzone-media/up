import React from 'react';
import { PrevIcon } from '../../assets';
import {
  StyledBackButton,
  StyledBackImg,
  StyledButtonLabel,
  StyledEditProfileButton,
  StyledHeaderToolbar,
  StyledHeaderToolbarContent,
  StyledHeaderToolbarLabel,
} from './styles';

interface IProps {
  onBack: () => void;
  buttonLabel: string;
  headerToolbarLabel: string;
  showEditProfileButton: boolean;
  showProfileEditModal?: () => void;
}

export const HeaderToolbar: React.FC<IProps> = ({
  onBack,
  buttonLabel,
  headerToolbarLabel,
  showEditProfileButton,
  showProfileEditModal,
}: IProps) => {
  return (
    <StyledHeaderToolbar>
      <StyledHeaderToolbarContent>
        <StyledBackButton onClick={onBack}>
          <StyledBackImg src={PrevIcon} />
          <StyledButtonLabel>{buttonLabel}</StyledButtonLabel>
        </StyledBackButton>
        {showEditProfileButton && (
          <StyledEditProfileButton onClick={showProfileEditModal}>
            Edit Profile
          </StyledEditProfileButton>
        )}
        <StyledHeaderToolbarLabel isEditVisible={showEditProfileButton}>
          {headerToolbarLabel}
        </StyledHeaderToolbarLabel>
      </StyledHeaderToolbarContent>
    </StyledHeaderToolbar>
  );
};
