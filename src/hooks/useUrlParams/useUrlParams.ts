import { useParams } from 'react-router-dom';
import { NetworkName } from '../../boot/types';

interface IParams {
  network: NetworkName;
  add: string;
  id: string;
}

export const useUrlParams = () => {
  const params = useParams<IParams>();

  return {
    network: params.network,
    address: params.add ? params.add.toLowerCase() : '',
    tokenId: params.id ? params.id : '',
  };
};
