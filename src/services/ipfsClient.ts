import axios from 'axios';
import Web3Service from './Web3Service';

const url: string = 'https://ipfs.fanzone.io/ipfs/';

const getIpfsPath = (hashedUrl: string) => {
  const hash = `0x${hashedUrl.slice(74)}`;
  const ipfsPath = Web3Service.web3.utils
    .hexToUtf8(hash)
    .replace('ipfs://', '');
  return ipfsPath;
};

export const getLSP3ProfileData = async (hashedUrl: string) => {
  const ipfsPath = getIpfsPath(hashedUrl);
  const result = await axios.get(url + ipfsPath);
  return result.data;
};

export const getLSP4Metadata = async (hashedUrl: string) => {
  const ipfsPath = getIpfsPath(hashedUrl);
  const result = await axios.get(url + ipfsPath);
  return result.data;
};
