import { LSP3ProfileApi } from './controllers/LSP3Profile';
import Web3Client from './Web3Service';
import { IEthereumService } from './IEthereumService';
import { LSP4DigitalAssetApi } from './controllers/LSP4DigitalAsset';

type ApiCalls = {
  [key: string]: (
    EthereumSerive: IEthereumService,
  ) => (...args: any[]) => Promise<any>;
};

type Api<A extends ApiCalls = any> = {
  [key in keyof A]: (...args: any) => Promise<any>;
};
const createBuildSlice =
  (web3Client: Web3Client) =>
  <IApiCalls extends ApiCalls>(apiCalls: IApiCalls): Api<IApiCalls> =>
    Object.entries(apiCalls).reduce((api, [name, fn]) => {
      return {
        ...api,
        [name]: fn(web3Client),
      };
    }, {} as Api<IApiCalls>);

export type API = {
  profiles: Api<typeof LSP3ProfileApi>;
  cards: Api<typeof LSP4DigitalAssetApi>;
};

export const buildApi = (web3Client: Web3Client): API => {
  const buildSlice = createBuildSlice(web3Client);
  return {
    profiles: buildSlice(LSP3ProfileApi),
    cards: buildSlice(LSP4DigitalAssetApi),
  };
};
