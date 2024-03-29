import { useCallback, useContext } from 'react';
import { ModalContext, IOnPresent } from '../../context/ModalProvider';

export const useModal = (
  ...[content, key, title, persist]: Parameters<IOnPresent>
) => {
  const { isOpen, onDismiss, onPresent } = useContext(ModalContext);

  const handlePresent = useCallback(() => {
    onPresent(content, key, title, persist);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, key, onPresent]);

  return { handlePresent, onDismiss, isOpen };
};
