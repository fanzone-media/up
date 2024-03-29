import detectEthereumProvider from '@metamask/detect-provider';
import { ReactText, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useConnect } from 'wagmi';
import { MetaMaskIcon, WalletConnectIcon } from '../../assets';
import {
  metamaskConnector,
  walletConnectConnector,
} from '../../boot/Web3Provider';
import { StyledModalButton, StyledModalButtonsWrapper } from '../Modal/styles';
import {
  StyledConnectorsWrapper,
  StyledMetaMaskConnectorButton,
  StyledMetaMaskIcon,
  StyledWalletConnectConnectorButton,
  StyledWalletConnectIcon,
  StyledWeb3WalletConnectModalContent,
} from './styles';

interface IProps {
  toastRef: React.MutableRefObject<ReactText | undefined>;
  onDismiss: () => any;
}

export const Web3WalletConnectModalContent = ({
  toastRef,
  onDismiss,
}: IProps) => {
  const { connect } = useConnect({
    onMutate() {
      toast.dismiss(toastRef.current);
      toastRef.current = toast.loading('connecting', {
        position: 'top-center',
      });
    },
    onSuccess() {
      if (toastRef && toastRef.current) {
        toast.update(toastRef.current, {
          render: 'Connected',
          type: 'success',
          closeOnClick: true,
          closeButton: true,
          autoClose: 2000,
          isLoading: false,
        });
      }
      onDismiss();
    },
    onError() {
      if (toastRef && toastRef.current) {
        toast.update(toastRef.current, {
          render: 'Connection failed',
          type: 'error',
          closeOnClick: true,
          closeButton: true,
          autoClose: 2000,
          isLoading: false,
        });
      }
    },
  });

  const [isMetaMaskInstalled, setIsMetaMaskInstalled] =
    useState<boolean>(false);

  useEffect(() => {
    detectEthereumProvider().then((provider) => {
      if (provider) {
        setIsMetaMaskInstalled(true);
      }
    });
  }, []);

  return (
    <StyledWeb3WalletConnectModalContent>
      <StyledConnectorsWrapper>
        <StyledMetaMaskConnectorButton
          disabled={!isMetaMaskInstalled}
          onClick={() => connect({ connector: metamaskConnector })}
        >
          <StyledMetaMaskIcon src={MetaMaskIcon} alt="metamask" />
        </StyledMetaMaskConnectorButton>
        <StyledWalletConnectConnectorButton
          onClick={() => connect({ connector: walletConnectConnector })}
        >
          <StyledWalletConnectIcon
            src={WalletConnectIcon}
            alt="walletconnect"
          />
        </StyledWalletConnectConnectorButton>
      </StyledConnectorsWrapper>
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
      </StyledModalButtonsWrapper>
    </StyledWeb3WalletConnectModalContent>
  );
};
