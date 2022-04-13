import axios from 'axios';
import { Readable } from 'stream';
import FormData from 'form-data';

const pinataCredentials = {
  api_key: process.env.PINATA_API_KEY as string,
  secret_api_key: process.env.PINATA_SECRETE_API_KEY as string,
};

export const catJsonFile = async (cid: string): Promise<object> =>
  new Promise(async (resolve, reject) =>
    axios
      .get(`${process.env.IPFS_HOST}/ipfs/${cid}`)
      .then((response) => resolve(response.data))
      .catch(reject),
  );

export const catFile = async (cid: string): Promise<Buffer> =>
  new Promise(async (resolve, reject) =>
    axios
      .get(`${process.env.IPFS_HOST}/ipfs/${cid}`, {
        responseType: 'arraybuffer',
      })
      .then((response) => resolve(Buffer.from(response.data, 'binary')))
      .catch(reject),
  );

const addData = async (url: string, data: string | FormData, config: any) => {
  try {
    const {
      data: { IpfsHash },
    } = await axios.post(url, data, config);

    return IpfsHash;
  } catch (error) {
    throw error;
  }
};

export const addJSON = async (data: string): Promise<string> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  return await addData(url, data, {
    pinata_api_key: pinataCredentials.api_key,
    pinata_secret_api_key: pinataCredentials.secret_api_key,
  });
};

export const addDirectory = async (jsons: Array<string>) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  jsons.forEach((json, index) => {
    data.append('file', Readable.from(json), {
      filepath: `upload/${index}.json`,
    });
  });

  return await addData(url, data, {
    'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
    pinata_api_key: pinataCredentials.api_key,
    pinata_secret_api_key: pinataCredentials.secret_api_key,
  });
};
