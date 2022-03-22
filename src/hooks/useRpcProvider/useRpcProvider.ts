import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';

export const useRpcProvider = (network: string): Provider => {
  const LUKSO_L14_PROVIDER = new ethers.providers.JsonRpcProvider(
    'https://rpc.l14.lukso.network',
  );
  const POLYGON_MAINNET_PROVIDER = new ethers.providers.JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
  );
  const POLYGON_MUMBAI_PROVIDER = new ethers.providers.JsonRpcProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MUMBAI_KEY}`,
  );
  const ETHEREUM_MAINNET_PROVIDER = new ethers.providers.JsonRpcProvider(
    'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  );

  if (network === 'mumbai') return POLYGON_MUMBAI_PROVIDER;
  if (network === 'polygon') return POLYGON_MAINNET_PROVIDER;
  if (network === 'ethereum') return ETHEREUM_MAINNET_PROVIDER;
  if (network === 'l14') return LUKSO_L14_PROVIDER;
  return POLYGON_MUMBAI_PROVIDER;
};
