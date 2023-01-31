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
  onDismiss: () => any;
}

export const Web3WalletConnectModalContent = ({ onDismiss }: IProps) => {
  const toastRef = useRef<ReactText>();

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
          isLoading: false,
          autoClose: 2000,
        });
      }
      onDismiss();
    },
    onError() {
      if (toastRef && toastRef.current) {
        toast.update(toastRef.current, {
          render: 'Connection failed',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
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
