import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NetworkName } from '../../boot/types';
import { getDefaultAddresses } from '../../utility/content/addresses';
import { Address } from '../../utils/types';

export const useDefaultAddresses = (
  type: 'profileAddresses' | 'assetsAddresses',
) => {
  const params = useParams<{ network: NetworkName }>();
  const [addresses, setAddresses] = useState<Array<Address>>([]);
  const [error, setError] = useState();

  useEffect(() => {
    getDefaultAddresses(params.network, type).then(
      (result) => {
        setAddresses(result);
      },
      (error) => {
        setError(error);
      },
    );
  }, [params.network, type]);

  return { addresses, error };
};
