import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect, useState } from 'react';
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
  const { connect } = useConnect({
    onSuccess() {
      onDismiss();
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
