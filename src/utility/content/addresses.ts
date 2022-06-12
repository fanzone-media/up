import { BaseProvider } from '@ethersproject/providers';
import { NetworkName } from '../../boot/types';
import { Address } from '../../utils/types';

export const getDefaultAddresses = async (
  network: NetworkName,
  type: 'assetsAddresses' | 'profileAddresses',
): Promise<Array<Address>> => {
  const res = await fetch(`./api/${network}/${type}.json`);
  return res.json();
};

export const trimedAddress = (address: Address) =>
  `${address.slice(0, 8)}...${address.slice(
    address.length - 4,
    address.length,
  )}`;

export const getWhiteListedTokenAddresses = (network: NetworkName) => {
  const whiteListedTokens: { [key in NetworkName]: Array<string> } = {
    polygon: [
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    ],
    mumbai: ['0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'],
    ethereum: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    l14: [''],
  };

  return whiteListedTokens[network];
};
