import { LSP3ProfileApi } from './controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from './controllers/LSP4DigitalAsset';
import { AuctionApi } from './controllers/Auction';

// type ApiCalls = {
//   [key: string]: (...args: any[]) => Promise<any>;
// };

// type Api<A extends ApiCalls = any> = {
//   [key in keyof A]: (...args: any) => Promise<any>;
// };
// const createBuildSlice =
//   <IApiCalls extends ApiCalls>(apiCalls: IApiCalls): Api<IApiCalls> =>
//     Object.entries(apiCalls).reduce((api, [name, fn]) => {
//       return {
//         ...api,
//         [name]: fn(),
//       };
//     }, {} as Api<IApiCalls>);

export type API = {
  profiles: typeof LSP3ProfileApi;
  cards: typeof LSP4DigitalAssetApi;
  auctions: typeof AuctionApi;
};

export const buildApi = (): API => {
  return {
    profiles: LSP3ProfileApi,
    cards: LSP4DigitalAssetApi,
    auctions: AuctionApi,
  };
};
