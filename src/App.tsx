import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import './App.css';
import { theme } from './boot/styles';
import Routes from './routes';
import { Footer, Header } from './components';
import { Chain, defaultChains, InjectedConnector, WagmiProvider } from 'wagmi';
import { ModalProvider } from './context/ModalProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const chains: Chain[] = [
  defaultChains[0],
  {
    id: 137,
    name: 'polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorers: [
      {
        name: 'Polyscan',
        url: 'https://polygonscan.com/',
      },
    ],
  },
  {
    id: 80001,
    name: 'mumbai',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com/'],
    blockExplorers: [
      {
        name: 'Polyscan',
        url: 'https://mumbai.polygonscan.com/',
      },
    ],
    testnet: true,
  },
  {
    id: 22,
    name: 'l14',
    nativeCurrency: {
      name: 'Lukso',
      symbol: 'LYXe',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.l14.lukso.network/'],
    blockExplorers: [
      {
        name: 'Blockscout',
        url: 'https://blockscout.com/lukso/l14/',
      },
    ],
    testnet: true,
  },
  {
    id: 2828,
    name: 'l16',
    nativeCurrency: {
      name: 'Lukso',
      symbol: 'LYXt',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.l16.lukso.network'],
    blockExplorers: [
      {
        name: 'Blockscout',
        url: 'https://explorer.execution.l16.lukso.network/',
      },
    ],
    testnet: true,
  },
];

const connectors = () => {
  return [new InjectedConnector({ chains, options: { shimDisconnect: true } })];
};

const App: React.FC = () => {
  useEffect(() => {});

  return (
    <ThemeProvider theme={theme}>
      <WagmiProvider autoConnect connectors={connectors}>
        <ModalProvider>
          <div className="App">
            <Header />
            <Routes />
            <Footer />
            <ToastContainer />
          </div>
        </ModalProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;
