import axios from 'axios';
import { ILSP8MetaData, ISetProfileData, SupportedInterface } from './models';
import { ethers } from 'ethers';
import FormData from 'form-data';
import Utils from './utilities/util';

const getIpfsPath = (hashedUrl: string) => {
  const hash = `0x${hashedUrl.slice(74)}`;
  const ipfsPath = ethers.utils.toUtf8String(hash).replace('ipfs://', '');
  return ipfsPath;
};

export const getLSP3ProfileData = async (hashedUrl: string) => {
  const ipfsPath = getIpfsPath(hashedUrl);
  const result = await axios.get(Utils.getURL(ipfsPath));
  return result.data;
};

export const getLSP4Metadata = async (
  hashedUrl: string,
  standard: SupportedInterface,
): Promise<ILSP8MetaData> => {
  if (standard === 'erc721') {
    const result = await axios.get(Utils.convertURL(hashedUrl));
    return result.data as ILSP8MetaData;
  } else {
    const ipfsPath = getIpfsPath(hashedUrl);
    const result = await axios.get(Utils.getURL(ipfsPath));
    return result.data as ILSP8MetaData;
  }
};

export const addFile = async (file: File) => {
  try {
    let data = new FormData();
    data.append('file', file);
    const {
      data: { IpfsHash },
    } = await axios.post(
      process.env.REACT_APP_IPFS_HOST
        ? `${process.env.REACT_APP_IPFS_HOST}/pinning/pinFileToIPFS`
        : '',
      data,
      {
        headers: {
          'Content-Type': `multipart/form-data`,
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRETE_API_KEY,
        },
      },
    );

    return `ipfs://${IpfsHash}`;
  } catch (error) {
    console.error(error);
  }
};

export const addData = async (profileData: ISetProfileData) => {
  try {
    const {
      data: { IpfsHash },
    } = await axios.post(
      process.env.REACT_APP_IPFS_HOST
        ? `${process.env.REACT_APP_IPFS_HOST}/pinning/pinJSONToIPFS`
        : '',
      {
        LSP3Profile: profileData,
      },
      {
        headers: {
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRETE_API_KEY,
        },
      },
    );

    return `ipfs://${IpfsHash}`;
  } catch (error) {
    console.error(error);
  }
};
