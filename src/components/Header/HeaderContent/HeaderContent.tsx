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
