import { useParams } from 'react-router-dom';
import { NetworkName } from '../../boot/types';

interface IParams {
  network: NetworkName;
  address: string;
  tokenId: string;
}

export const useUrlParams = () => {
  const params = useParams<IParams>();

  return {
    network: params.network,
    address: params.address,
    tokenId: params.tokenId,
  };
};
