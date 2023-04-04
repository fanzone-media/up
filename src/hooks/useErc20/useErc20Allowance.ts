import { useEffect, useState } from 'react';
import { NetworkName } from '../../boot/types';
import { Erc20Allowance, ERC20Api } from '../../services/controllers/ERC20';
import { Address } from '../../utils/types';

interface IErc20Allowance {
  data: Erc20Allowance | null;
  isLoading: boolean;
  error: string | null;
  refetch: (holderAddress?: Address, spenderAddress?: Address) => Promise<void>;
}

/**
 * custom hook for fetching erc20 allowance of an address
 *
 * @param tokenAddress  erc20 token address
 * @param holderAddress address which holds the erc20 tokens
 * @param spenderAddress address whose allowance needs to be fetched
 */
export const useErc20Allowance = (
  tokenAddress: Address,
  holderAddress: Address,
  spenderAddress: Address,
  network: NetworkName,
): IErc20Allowance => {
  const hA = holderAddress;
  const sA = spenderAddress;
  const [data, setData] = useState<Erc20Allowance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (
    holderAddress?: Address,
    spenderAddress?: Address,
  ): Promise<void> => {
    setData(null);
    setError(null);
    setIsLoading(true);

    try {
      const result = await ERC20Api.getErc20Allowance(
        tokenAddress,
        holderAddress ? holderAddress : hA,
        spenderAddress ? spenderAddress : sA,
        network,
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
  }, [tokenAddress, holderAddress, network]);

  return { data, isLoading, error, refetch: fetchData };
};
