import axios from "axios";
import pinataSDK, { PinataClient } from "@pinata/sdk";

export const pinataClient: PinataClient = pinataSDK(
  process.env.PINATA_API_KEY as string,
  process.env.PINATA_SECRETE_API_KEY as string
);

export const catJsonFile = async (cid: string): Promise<object> =>
  new Promise(async (resolve, reject) =>
    axios
      .get(`${process.env.IPFS_HOST}/ipfs/${cid}`)
      .then((response) => resolve(response.data))
      .catch(reject)
  );

export const catFile = async (cid: string): Promise<Buffer> =>
  new Promise(async (resolve, reject) =>
    axios
      .get(`${process.env.IPFS_HOST}/ipfs/${cid}`, {
        responseType: "arraybuffer",
      })
      .then((response) => resolve(Buffer.from(response.data, "binary")))
      .catch(reject)
  );

export const addJSON = async (data: string): Promise<string> =>
  new Promise(async (resolve, reject) =>
    pinataClient
      .pinJSONToIPFS(JSON.parse(data))
      .then(({ IpfsHash }) => resolve(IpfsHash))
      .catch(reject)
  );
