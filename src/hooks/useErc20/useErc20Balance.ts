import { useEffect, useState } from 'react';
import { NetworkName } from '../../boot/types';
import { ERC20Api, Erc20Balance } from '../../services/controllers/ERC20';
import { Address } from '../../utils/types';

interface IErc20Balance {
  data: Array<Erc20Balance> | null;
  isLoading: boolean;
  error: string | null;
  refetch: (holderAddress?: Address) => Promise<void>;
}

/**
 * custom hook for fetching erc20 balances of an address
 *
 * @param tokenAddresses array of erc20 tokens addresses
 * @param holderAddress address for which the balance needs to be fetched
 */
export const useErc20Balance = (
  tokenAddresses: Array<Address>,
  holderAddress: Address,
  network: NetworkName,
): IErc20Balance => {
  const hA = holderAddress;
  const [data, setData] = useState<Array<Erc20Balance> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (holderAddress?: Address): Promise<void> => {
    setData(null);
    setError(null);
    setIsLoading(true);

    try {
      const result = await Promise.all(
        tokenAddresses.map((tokenAddress) =>
          ERC20Api.getErc20Balance(
            tokenAddress,
            holderAddress ? holderAddress : hA,
            network,
          ),
        ),
      );
      setData(result);
    } catch (error) {
      setError((error as Error).message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holderAddress, network]);

  return { data, isLoading, error, refetch: fetchData };
};
