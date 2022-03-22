/* eslint-disable react-hooks/rules-of-hooks */
import Web3 from 'web3';
import { useRpcProvider } from '../../hooks/useRpcProvider';
import { Lns__factory } from '../../submodules/fanzone-smart-contracts/typechain';

const lnsAddress = '0x8533c8c4d72d07c8593789dfff38d67192fb2088';

export const fetchUserAddress = async (
  vanityName: string,
  network: string,
): Promise<string | null> => {
  const provider = useRpcProvider(network);
  const contract = Lns__factory.connect(lnsAddress, provider);
  const hexName = Web3.utils.asciiToHex(vanityName);
  const paddedName = hexName.padEnd(64 - hexName.length, '0');
  const res = await contract
    .tokenOwnerOf(paddedName)
    .then((result: any) => {
      return result;
    })
    .catch((err: any) => {
      throw new Error('name not found');
    });
  return res;
};

export const setVanityName = async (
  vanityName: string,
  address: string,
  network: string,
) => {
  // const provider = useRpcProvider(network);
  // const contract = Lns__factory.connect(lnsAddress,provider)
  // const hexName = Web3.utils.asciiToHex(vanityName);
  // const paddedName = hexName.padEnd(64 - hexName.length, '0');
  // if (!Web3.utils.isAddress(address)) throw new Error('invalid address');
  // // const res = await contract
  // //   .setVanityName('0x16E38E9375Ffd9b1C6b424427b2366DEfB513D77', paddedName)
  // //   .send({
  // //     from: '0xD810Fa13696f40fb822238A84DF23b99eA74c807',
  // //     gas: 3000000,
  // //     value: Web3.utils.toWei('0.1', 'ether'),
  // //   });
};

export const checkNameAvailabity = async (
  vanityName: string,
  network: string,
): Promise<string | null> => {
  const provider = useRpcProvider(network);
  const contract = Lns__factory.connect(lnsAddress, provider);
  const hexName = Web3.utils.asciiToHex(vanityName);
  const paddedName = hexName.padEnd(64 - hexName.length, '0');
  const res = await contract
    .tokenOwnerOf(paddedName)
    .then((result: any) => {
      return result;
    })
    .catch((err: any) => {
      return null;
    });
  return res;
};
