import { ReactText, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { UserIcon, WalletIcon } from '../../../assets';
import {
  LOCAL_STORAGE_KEYS,
  ProfilePermissionsLocal,
  useLocalStorage,
  useModal,
} from '../../../hooks';
import { Web3WalletConnectModalContent } from '../../Web3WalletConnectModalContent';
import {
  StyledButtonConainer,
  StyledButtonIcon,
  StyledButtonText,
  StyledConnectMetaMask,
  StyledMyUpLink,
  StyledSignUpLink,
} from './styles';

export const HeaderContent = () => {
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
          closeOnClick: true,
          closeButton: true,
          autoClose: 2000,
          isLoading: false,
        });
      }
    },
    onError() {
      if (toastRef && toastRef.current) {
        toast.update(toastRef.current, {
          render: 'Something went wrong',
          type: 'error',
          closeOnClick: true,
          closeButton: true,
          autoClose: 2000,
          isLoading: false,
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

  const { getItems } = useLocalStorage();

  const permissions = getItems(
    LOCAL_STORAGE_KEYS.UP,
  ) as ProfilePermissionsLocal;

  const upAddressLink =
    permissions && permissions['polygon']
      ? `/up/polygon/profile/${Object.keys(permissions['polygon'])[0]}`
      : undefined;

  return (
    <StyledButtonConainer>
      {upAddressLink && (
        <StyledMyUpLink to={upAddressLink}>
          <StyledButtonIcon src={UserIcon} alt="" />
          <StyledButtonText>My UP</StyledButtonText>
        </StyledMyUpLink>
      )}
      <StyledConnectMetaMask
        disabled={isLoading}
        onClick={() =>
          isConnected ? disconnect() : onPresentWeb3WalletConnectModal()
        }
      >
        <StyledButtonIcon src={WalletIcon} alt="" />
        <StyledButtonText>
          {isConnected ? 'Disconnect wallet' : 'Connect wallet'}
        </StyledButtonText>
      </StyledConnectMetaMask>
      <StyledSignUpLink
        href="https://app.fanzone.io/login"
        target="_blank"
        rel="noreferrer"
      >
        {upAddressLink ? 'Go to Fanzone App' : 'Sign up'}
      </StyledSignUpLink>
    </StyledButtonConainer>
  );
};
