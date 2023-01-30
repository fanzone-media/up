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

export type IOnDismissCallback = (callback: () => any) => void;

interface ModalsContext {
  content?: React.ReactNode;
  isOpen?: boolean;
  modalKey?: string;
  onPresent: IOnPresent;
  onDismiss: () => void;
  onDismissCallback: IOnDismissCallback;
}

export const ModalContext = createContext<ModalsContext>({
  isOpen: false,
  onPresent: () => {},
  onDismiss: () => {},
  onDismissCallback: () => {},
});

export const ModalProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState<React.ReactNode>();
  const [modalKey, setModalKey] = useState<string>();
  const [persist, setPersist] = useState(false);
  const [dismissCallback, setDismissCallback] = useState<() => () => any>();

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

  const handleDismiss = useCallback(
    () => {
      setContent(undefined);
      setIsOpen(false);
      setModalKey(undefined);
      document.body.style.overflow = 'auto';
      dismissCallback && dismissCallback();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setContent, setIsOpen, modalKey, dismissCallback],
  );

  const handleDismissCallback: IOnDismissCallback = useCallback(
    (dismissCallback) => {
      setDismissCallback(() => dismissCallback);
    },
    [],
  );

  useEffect(() => {
    if (isOpen) {
      document.onkeydown = function (evt) {
        evt = evt || window.event;
        var isEscape = false;
        if ('key' in evt) {
          isEscape = evt.key === 'Escape' || evt.key === 'Esc';
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
        onDismissCallback: handleDismissCallback,
      }}
    >
      {children}
      {isOpen && (
        <StyledModalWrapper>
          <StyledModalBackdrop
            onClick={!persist ? () => handleDismiss() : () => null}
          />
          <StyledModalBoxWrapper>
            <StyledCloseModalButton onClick={() => handleDismiss()}>
              <StyledCloseButtonIcon src={CloseIcon} alt="" />
            </StyledCloseModalButton>
            <StyledModalBoxInner>
              {title && <StyledModalBoxTitle>{title}</StyledModalBoxTitle>}
              {
                React.isValidElement(content) && React.cloneElement(content)
                // React.cloneElement(content, {
                //   onDismiss: handleDismiss,
                // })
              }
            </StyledModalBoxInner>
          </StyledModalBoxWrapper>
        </StyledModalWrapper>
      )}
    </ModalContext.Provider>
  );
};
