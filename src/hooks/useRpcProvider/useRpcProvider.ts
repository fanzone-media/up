import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { NetworkName } from '../../boot/types';

export const useRpcProvider = (network: string): Provider => {
  if (network === 'mumbai') {
    const POLYGON_MUMBAI_PROVIDER = new ethers.providers.JsonRpcProvider(
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MUMBAI_KEY}`,
    );
    return POLYGON_MUMBAI_PROVIDER;
  }
  if (network === 'polygon') {
    const POLYGON_MAINNET_PROVIDER = new ethers.providers.JsonRpcProvider(
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
    );
    return POLYGON_MAINNET_PROVIDER;
  }
  if (network === 'ethereum') {
    const ETHEREUM_MAINNET_PROVIDER = new ethers.providers.JsonRpcProvider(
      'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    );
    return ETHEREUM_MAINNET_PROVIDER;
  }
  if (network === 'l14') {
    const LUKSO_L14_PROVIDER = new ethers.providers.JsonRpcProvider(
      'https://rpc.l14.lukso.network',
    );
    return LUKSO_L14_PROVIDER;
  }

  return {} as Provider;
};
