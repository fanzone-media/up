import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { NetworkName } from '../../boot/types';

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
        'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
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

  return {} as Provider;
};
