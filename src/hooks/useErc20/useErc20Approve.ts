import { Signer } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import {
  ERC20__factory,
  LSP6KeyManagerProxy__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { TX_WAIT_BLOCKS } from '../../utility/constants';
import {
  ExecuteViaEOA,
  ExecuteViaKeyManager,
  ExecuteViaUniversalProfile,
  IBlockchainTransactionHookOptions,
} from '../../utility/types';
import { Address } from '../../utils/types';
import { encodeTxDataForUniversalProfileExecuteCall } from '../../utils/universalProfile';

interface IFuncParams {
  /**
   * the amount of tokens that needs to approved for spending
   */
  amount: number;
  /**
   * how to execute a blockchain call based on universal profile owner ship
   */
  executeVia: ExecuteViaKeyManager | ExecuteViaUniversalProfile | ExecuteViaEOA;
}

interface IErc20Approve {
  /**
   * function to propagate the transaction on blockchain
   */
  approve: (funcParams: IFuncParams) => void;
  /**
   * state of the blockchain transaction
   */
  isTransacting: boolean;
  /**
   * state of the amount approval
   */
  isApproved: boolean;
  error: string | null;
}

interface IHookParams {
  /**
   * the erc20 token that needs to be approved for spending
   */
  erc20Token: Address;
  /**
   * the address that needs approval to spend erc20 token on other behalf
   */
  spenderAddress: Address;
  network: NetworkName;
}

/**
 * custom hook for erc20 token approval of allowance
 *
 * @param hookParams
 * @param hookParams.erc20Token
 * @param hookParams.spenderAddress
 * @param options
 */
export const useErc20Approve = (
  hookParams: IHookParams,
  {
    onMutate,
    onTransaction,
    onSuccess,
    onError,
  }: IBlockchainTransactionHookOptions<IHookParams & IFuncParams> = {},
): IErc20Approve => {
  const { erc20Token, spenderAddress } = hookParams;

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: signer } = useSigner();

  const approve = async (funcParams: IFuncParams): Promise<void> => {
    const { amount, executeVia } = funcParams;

    setError(null);
    setIsTransacting(true);

    if (!signer) {
      setIsTransacting(false);
      setError('wallet not connected');
      return;
    }

    try {
      const erc20Contract = ERC20__factory.connect(
        erc20Token,
        signer as Signer,
      );
      //   const convertedAmount =
      //     amount * 10 ** WHITE_LISTED_TOKENS[network][erc20Token].decimals;

      const encodedApprove = erc20Contract.interface.encodeFunctionData(
        'approve',
        [spenderAddress, amount],
      );

      if (executeVia.type === 'Key_Manager') {
        const universalProfileContract = UniversalProfileProxy__factory.connect(
          executeVia.upAddress,
          signer as Signer,
        );
        const encodedExecute = encodeTxDataForUniversalProfileExecuteCall(
          universalProfileContract,
          erc20Token,
          encodedApprove,
        );
        const keyManagerContract = LSP6KeyManagerProxy__factory.connect(
          executeVia.upOwnerAddress,
          signer as Signer,
        );

        onMutate && onMutate({ ...hookParams, ...funcParams });

        // const transaction = await executeCallToUniversalProfileViaKeyManager(
        //   { gasLimit: TX_GAS_LIMIT },
        //   keyManagerContract,
        //   encodedExecute,
        // );

        const transaction = await keyManagerContract.execute(encodedExecute);

        onTransaction &&
          onTransaction({ ...hookParams, ...funcParams }, transaction);

        const minedTransaction = await transaction.wait(TX_WAIT_BLOCKS);

        if (minedTransaction.status === 0)
          throw new Error('Transaction reverted');

        setIsApproved(true);
        setIsTransacting(false);

        onSuccess &&
          onSuccess({ ...hookParams, ...funcParams }, minedTransaction);

        return;
      }

      if (executeVia.type === 'Universal_Profile') {
        const universalProfileContract = UniversalProfileProxy__factory.connect(
          executeVia.upAddress,
          signer as Signer,
        );

        onMutate && onMutate({ ...hookParams, ...funcParams });

        // const transaction = await executeCallViaUniversalProfile(
        //   { gasLimit: TX_GAS_LIMIT },
        //   universalProfileContract,
        //   WHITE_LISTED_TOKENS[network]['weth'].address,
        //   encodedApprove,
        // );

        const transaction = await universalProfileContract.execute(
          '0x0',
          erc20Token,
          0,
          encodedApprove,
        );

        onTransaction &&
          onTransaction({ ...hookParams, ...funcParams }, transaction);

        const minedTransaction = await transaction.wait(TX_WAIT_BLOCKS);

        if (minedTransaction.status === 0)
          throw new Error('Transaction reverted');

        setIsApproved(true);
        setIsTransacting(false);

        onSuccess &&
          onSuccess({ ...hookParams, ...funcParams }, minedTransaction);

        return;
      }

      onMutate && onMutate({ ...hookParams, ...funcParams });

      const transaction = await erc20Contract.approve(spenderAddress, amount);

      onTransaction &&
        onTransaction({ ...hookParams, ...funcParams }, transaction);

      const minedTransaction = await transaction.wait(TX_WAIT_BLOCKS);

      if (minedTransaction.status === 0)
        throw new Error('Transaction reverted');

      setIsApproved(true);

      onSuccess &&
        onSuccess({ ...hookParams, ...funcParams }, minedTransaction);
    } catch (error) {
      setError((error as Error).message);

      onError && onError(error as Error);
    }

    setIsTransacting(false);
  };

  return { approve, isTransacting, isApproved, error };
};
