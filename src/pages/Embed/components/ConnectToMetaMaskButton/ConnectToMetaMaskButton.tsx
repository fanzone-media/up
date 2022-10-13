import detectEthereumProvider from '@metamask/detect-provider';
import { ReactText, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useConnect } from 'wagmi';
import { StyledConnectToMetaMaskButton } from './styles';

export const ConnectToMetaMaskButton = () => {
  const [{ data }, connect] = useConnect();
  const [{}, disconnect] = useAccount();
  const connectToastRef = useRef<ReactText>();

  const handleConnect = async () => {
    const connectToast = () =>
      (connectToastRef.current = toast('Connecting', {
        type: 'default',
        position: 'top-center',
      }));

    if (data.connected) {
      disconnect();
    } else {
      connectToast();
      const provider = await detectEthereumProvider();
      if (provider) {
        console.log('connect');
        connect(data.connectors[0])
          .then(() => {
            toast('Connected', {
              type: 'success',
              position: 'top-center',
              autoClose: 2000,
            });
          })
          .finally(() => {
            toast.dismiss(connectToastRef.current);
          });
      } else {
        toast.dismiss(connectToastRef.current);
        toast('Please install metamask', {
          type: 'error',
          position: 'top-center',
        });
      }
    }
  };

  return (
    <StyledConnectToMetaMaskButton onClick={handleConnect}>
      {data.connected ? 'Disconnect wallet' : 'Connect wallet'}
    </StyledConnectToMetaMaskButton>
  );
};
