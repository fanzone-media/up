import React, { createContext, useCallback, useEffect, useState } from 'react';
import { CloseIcon } from '../../assets';
import {
  StyledModalBackdrop,
  StyledModalBoxInner,
  StyledModalBoxTitle,
  StyledModalBoxWrapper,
  StyledModalWrapper,
} from '../../components/Modal/styles';
import {
  StyledCloseButtonIcon,
  StyledCloseModalButton,
} from '../../components/ModalOverlay/styles';

export type IOnPresent = (
  content: React.ReactNode,
  key: string,
  title?: string,
  persist?: boolean,
) => void;

interface ModalsContext {
  content?: React.ReactNode;
  isOpen?: boolean;
  modalKey?: string;
  onPresent: IOnPresent;
  onDismiss: () => void;
}

export const ModalContext = createContext<ModalsContext>({
  isOpen: false,
  onPresent: () => {},
  onDismiss: () => {},
});

export const ModalProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState<React.ReactNode>();
  const [modalKey, setModalKey] = useState<string>();
  const [persist, setPersist] = useState(false);

  const handlePresentCb: IOnPresent = (content, key, title, persist) => {
    setModalKey(key);
    setIsOpen(true);
    setContent(content);
    setTitle(title ? title : '');
    setPersist(persist ? persist : false);

    // Disable page scrollbar on modal open
    document.body.style.overflow = 'hidden';
  };

  const handlePresent = useCallback(handlePresentCb, [
    setContent,
    setIsOpen,
    setModalKey,
  ]);

  const handleDismiss = useCallback(() => {
    setContent(undefined);
    setIsOpen(false);
    setModalKey(undefined);
    document.body.style.overflow = 'auto';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContent, setIsOpen, modalKey]);

  useEffect(() => {
    if (isOpen) {
      document.onkeydown = function (evt) {
        evt = evt || window.event;
        var isEscape = false;
        if ('key' in evt) {
          isEscape = evt.key === 'Escape' || evt.key === 'Esc';
        } else {
          isEscape = evt.keyCode === 27;
        }
        if (isEscape) {
          handleDismiss();
        }
      };
    }
  }, [isOpen, handleDismiss]);

  return (
    <ModalContext.Provider
      value={{
        content,
        isOpen,
        modalKey,
        onPresent: handlePresent,
        onDismiss: handleDismiss,
      }}
    >
      {children}
      {isOpen && (
        <StyledModalWrapper>
          <StyledModalBackdrop
            onClick={!persist ? handleDismiss : () => null}
          />
          <StyledModalBoxWrapper>
            <StyledCloseModalButton onClick={handleDismiss}>
              <StyledCloseButtonIcon src={CloseIcon} alt="" />
            </StyledCloseModalButton>
            <StyledModalBoxInner>
              {title && <StyledModalBoxTitle>{title}</StyledModalBoxTitle>}
              {React.isValidElement(content) &&
                React.cloneElement(content, {
                  onDismiss: handleDismiss,
                })}
              {/* <StyledModalButtonsWrapper topMargin={false}>
                {!persist && (
                  <StyledModalButton variant="gray" onClick={handleDismiss}>
                    Cancel
                  </StyledModalButton>
                )}
              </StyledModalButtonsWrapper> */}
            </StyledModalBoxInner>
          </StyledModalBoxWrapper>
        </StyledModalWrapper>
      )}
    </ModalContext.Provider>
  );
};
