import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Web3WalletConnectModalContent } from '../../../../components/Web3WalletConnectModalContent';
import { useModal } from '../../../../hooks';
import { StyledConnectToMetaMaskButton } from './styles';

export const ConnectToMetaMaskButton = () => {
  const { isConnected } = useAccount();
  const { isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  const {
    handlePresent: onPresentWeb3WalletConnectModal,
    onDismiss: onDismissWeb3WalletConnectModal,
  } = useModal(
    <Web3WalletConnectModalContent
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
