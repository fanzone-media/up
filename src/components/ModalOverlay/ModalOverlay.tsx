import React, { ReactNode, useRef } from 'react';
import { CloseIcon } from '../../assets';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import {
  StyledCloseButtonIcon,
  StyledCloseModalButton,
  StyledModal,
  StyledModalOverlay,
} from './styles';

interface IProps {
  children: ReactNode;
  onClose: () => void;
}

export const ModalOverlay: React.FC<IProps> = ({ children, onClose }) => {
  const modalRef = useRef(null);
  useOutsideClick(modalRef, onClose);
  return (
    <StyledModalOverlay>
      <StyledModal ref={modalRef}>
        <StyledCloseModalButton>
          <StyledCloseButtonIcon src={CloseIcon} alt="" />
        </StyledCloseModalButton>
        {children}
      </StyledModal>
    </StyledModalOverlay>
  );
};
