import axios from 'axios';
import Web3Service from './Web3Service';
import { create } from "ipfs-http-client";
import { ILSP8MetaData, ISetProfileData } from './models';

const url: string = 'https://ipfs.fanzone.io/ipfs/';
const IPFS_HOST = 'ipfs.infura.io';
const IPFS_PORT = 5001;
const IPFS_PROTOCOL = 'https';
const ipfsApi = create({host: IPFS_HOST, port: IPFS_PORT, protocol: IPFS_PROTOCOL});

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

export const getLSP4Metadata = async (hashedUrl: string): Promise<ILSP8MetaData> => {
  const ipfsPath = getIpfsPath(hashedUrl);
  const result = await axios.get(url + ipfsPath);
  return result.data as ILSP8MetaData;
};

// export const addFile = async (file: File) => {
//   const res = await axios.post(process.env.REACT_APP_IPFS_HOST ? `${process.env.REACT_APP_IPFS_HOST}/pinning/pinFileToIPFS` : "", File, {
//     maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
//     headers: {
//         'Content-Type': `multipart/form-data; boundary="----arbitrary boundary"`,
//         pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
//         pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRETE_API_KEY
//     }
//   });
//   console.log(res);
// }

export const addFile = async (file: File) => {
  try {
    const res = await ipfsApi.add(file);
    return `ipfs://${res.path}`;
  } catch (err) {
      console.error(err);
  }
}

export const addData = async (profileData: string) => {
  try {
    const res = await ipfsApi.add(profileData);
    return `ipfs://${res.path}`;
  } catch (err) {
      console.error(err);
  }
}
