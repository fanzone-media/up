import styled from 'styled-components';

export const StyledWeb3WalletConnectModalContent = styled.div``;

export const StyledConnectorsWrapper = styled.div`
  display: flex;
`;

export const StyledMetaMaskConnectorButton = styled.button`
  display: flex;
  width: 100%;
`;

export const StyledMetaMaskIcon = styled.img`
  height: 7em;
  margin: auto;
`;

export const StyledWalletConnectConnectorButton = styled(
  StyledMetaMaskConnectorButton,
)``;

export const StyledWalletConnectIcon = styled(StyledMetaMaskIcon)`
  width: 9em;
`;
