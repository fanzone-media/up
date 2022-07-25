import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';

// NOTE: using StaticJsonRpcProvider to prevent `eth_chainId` RPC calls during setup of provider
// since we know what network we want to query
export const useRpcProvider = (network: string): Provider => {
  if (network === 'mumbai') {
    const POLYGON_MUMBAI_PROVIDER = new ethers.providers.StaticJsonRpcProvider(
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MUMBAI_KEY}`,
      { name: 'mumbai', chainId: 80001 },
    );
    return POLYGON_MUMBAI_PROVIDER;
  }
  if (network === 'polygon') {
    const POLYGON_MAINNET_PROVIDER = new ethers.providers.StaticJsonRpcProvider(
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
      { name: 'polygon', chainId: 137 },
    );
    return POLYGON_MAINNET_PROVIDER;
  }
  if (network === 'ethereum') {
    const ETHEREUM_MAINNET_PROVIDER =
      new ethers.providers.StaticJsonRpcProvider(
        'https://eth-mainnet.alchemyapi.io/v2/hhezpl-iF6BGSLuXWN7HIXEOIsbZ5FnD',
        { name: 'ethereum', chainId: 1 },
      );
    return ETHEREUM_MAINNET_PROVIDER;
  }
  if (network === 'l14') {
    const LUKSO_L14_PROVIDER = new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.l14.lukso.network',
      { name: 'lukso', chainId: 22 },
    );
    return LUKSO_L14_PROVIDER;
  }
  if (network === 'l16') {
    const LUKSO_L16_PROVIDER = new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.l16.lukso.network',
      { name: 'lukso', chainId: 2828 },
    );
    return LUKSO_L16_PROVIDER;
  }
  return {} as Provider;
};
