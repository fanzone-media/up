import React, { ReactNode } from 'react';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { Chain, polygon, polygonMumbai, mainnet } from '@wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

const l14: Chain = {
  id: 22,
  name: 'L14',
  network: 'l14',
  nativeCurrency: {
    name: 'Lukso',
    symbol: 'LYXe',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://rpc.l14.lukso.network/'] },
    default: { http: ['https://rpc.l14.lukso.network/'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.com/lukso/l14/',
    },
  },
  testnet: true,
};

const l16: Chain = {
  id: 2828,
  name: 'L16',
  network: 'l16',
  nativeCurrency: {
    name: 'Lukso',
    symbol: 'LYXt',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://rpc.l16.lukso.network'] },
    default: { http: ['https://rpc.l16.lukso.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.execution.l16.lukso.network/',
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [mainnet, polygon, polygonMumbai, l14, l16],
  [
    publicProvider(),
    alchemyProvider({
      apiKey: process.env.REACT_APP_ALCHEMY_POLYGON_KEY || '',
    }),
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_MUMBAI_KEY || '' }),
    publicProvider(),
    publicProvider(),
  ],
);

export const metamaskConnector = new MetaMaskConnector({ chains });
export const walletConnectConnector = new WalletConnectConnector({
  chains,
  options: { qrcode: true, projectId: '3fdde2614adba3808984d4ddc3cf226e' },
});

const client = createClient({
  connectors: [metamaskConnector, walletConnectConnector],
  autoConnect: true,
  provider,
});

interface IProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<IProps> = ({ children }: IProps) => {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
};
