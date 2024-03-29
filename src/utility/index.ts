import { BigNumber, BigNumberish } from 'ethers';
import { BlockScoutIcon, EtherScanLogo, polygonExplorerIcon } from '../assets';
import { NetworkName } from '../boot/types';
import { IWhiteListedTokens } from '../services/models';
import { Address } from '../utils/types';

export enum STATUS {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

export const interfaceIds: { [key: string]: string } = {
  lsp8: '0x49399145',
  lsp4: '0xa4d96624',
  erc721: '0x80ac58cd',
};

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
    case 'l16':
      return {
        exploreUrl: 'https://explorer.execution.l16.lukso.network/address/',
        icon: BlockScoutIcon,
      };
    case 'mumbai':
      return {
        exploreUrl: 'https://mumbai.polygonscan.com/address/',
        icon: polygonExplorerIcon,
      };
    case 'ethereum':
      return {
        exploreUrl: 'https://etherscan.io/address/',
        icon: EtherScanLogo,
      };
  }
};

export const isValidChainId = (
  currenChainId: number,
  validChainIds: Array<number> = [1, 137, 22, 8001],
): boolean => {
  return validChainIds.includes(currenChainId);
};

export const isValidConnection = (
  connected: boolean,
  currenChainId?: number,
  validChainIds?: Array<number>,
) => connected && isValidChainId(currenChainId || 0, validChainIds);

export const displayPrice = (price: BigNumberish, decimals: number) => {
  return Number(price) / 10 ** decimals;
};

export const convertPrice = (price: BigNumberish, decimals: number) => {
  return BigNumber.isBigNumber(price) ? price : Number(price) * 10 ** decimals;
};

export const getAcceptedTokenDetails = (
  whiteListedTokens: Array<IWhiteListedTokens>,
  acceptedToken: Address,
) => {
  return whiteListedTokens.find((i) => i.tokenAddress === acceptedToken);
};
