import { BlockScoutIcon, polygonExplorerIcon } from '../assets';
import { NetworkName } from '../boot/types';

export enum STATUS {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

export const sm = '(min-width: 640px)';

export const md = '(min-width: 768px)';

export const lg = '(min-width: 1024px)';

export const xl = '(min-width: 1280px)';

export const getChainExplorer = (network: NetworkName) => {
  switch (network) {
    case 'polygon':
      return {
        exploreUrl: 'https://polygonscan.com/address/',
        icon: polygonExplorerIcon,
      };
    case 'l14':
      return {
        exploreUrl: 'https://blockscout.com/lukso/l14/address/',
        icon: BlockScoutIcon,
      };
    case 'mumbai':
      return {
        exploreUrl: 'https://mumbai.polygonscan.com/address/',
        icon: polygonExplorerIcon,
      };
  }
};

export const isValidChainId = (
  currenChainId: number,
  validChainIds: Array<number> = [137, 22, 8001],
): boolean => {
  return validChainIds.includes(currenChainId);
};

export const isValidConnection = (
  connected: boolean,
  currenChainId?: number,
  validChainIds?: Array<number>,
) => connected && isValidChainId(currenChainId || 0, validChainIds);
