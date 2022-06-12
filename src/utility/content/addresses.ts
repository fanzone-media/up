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
