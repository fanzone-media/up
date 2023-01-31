import { ReactText, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Web3WalletConnectModalContent } from '../../../../components/Web3WalletConnectModalContent';
import { useModal } from '../../../../hooks';
import { StyledConnectToMetaMaskButton } from './styles';

export const ConnectToMetaMaskButton = () => {
  const toastRef = useRef<ReactText>();

  const { isConnected } = useAccount();
  const { isLoading } = useConnect();
  const { disconnect } = useDisconnect({
    onMutate() {
      toast.dismiss(toastRef.current);
      toastRef.current = toast.loading('disconnecting', {
        position: 'top-center',
      });
    },
    onSuccess() {
      if (toastRef && toastRef.current) {
        toast.update(toastRef.current, {
          render: 'Disconnected',
          type: 'warning',
          isLoading: false,
          autoClose: 2000,
        });
      }
    },
    onError() {
      if (toastRef && toastRef.current) {
        toast.update(toastRef.current, {
          render: 'Something went wrong',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        });
      }
    },
  });

  const {
    handlePresent: onPresentWeb3WalletConnectModal,
    onDismiss: onDismissWeb3WalletConnectModal,
  } = useModal(
    <Web3WalletConnectModalContent
      toastRef={toastRef}
      onDismiss={() => onDismissWeb3WalletConnectModal()}
    />,
    'Connect Wallet Modal',
    'Connect Wallet',
  );

  return (
    <StyledConnectToMetaMaskButton
      disabled={isLoading}
      onClick={() =>
        isConnected ? disconnect() : onPresentWeb3WalletConnectModal()
      }
    >
      {isConnected ? 'Disconnect wallet' : 'Connect wallet'}
    </StyledConnectToMetaMaskButton>
  );
};
