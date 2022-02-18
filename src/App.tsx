import React, { useEffect } from 'react';
import './App.css';
import Routes from './routes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Chain, defaultChains, InjectedConnector, WagmiProvider } from 'wagmi';

const chains: Chain[] = [
  defaultChains[0],
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://polygon-rpc.com/'
    ],
    blockExplorers: [
      {
        name: 'Polyscan',
        url: 'https://polygonscan.com/'
      }
    ]
  },
  {
    id: 80001,
    name: 'Mumbai',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://matic-mumbai.chainstacklabs.com/'
    ],
    blockExplorers: [
      {
        name: 'Polyscan',
        url: 'https://mumbai.polygonscan.com/'
      }
    ],
    testnet: true
  },
  {
    id: 22,
    name: 'L14',
    nativeCurrency: {
      name: 'Lukso',
      symbol: 'LYXe',
      decimals: 18
    },
    rpcUrls: [
      'https://rpc.l14.lukso.network/'
    ],
    blockExplorers: [
      {
        name: 'Blockscout',
        url: 'https://blockscout.com/lukso/l14/'
      }
    ],
    testnet: true
  }
];

const connectors = () => {
  return [
    new InjectedConnector({chains, options: {shimDisconnect: true}}),
  ];
};


function App() {
  
  useEffect(() => {});

  return (
    <WagmiProvider autoConnect connectors={connectors}>
      <div className="App">
        <Header />
        <Routes />
        <Footer />
      </div>
    </WagmiProvider>
  );
}

export default App;
