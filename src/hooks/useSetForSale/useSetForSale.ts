import { Signer } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import {
  CardTokenProxy__factory,
  LSP6KeyManagerProxy__factory,
  UniversalProfileProxy__factory,
} from '../../submodules/fanzone-smart-contracts/typechain';
import { TX_WAIT_BLOCKS } from '../../utility/constants';
import { WHITE_LISTED_TOKENS } from '../../utility/content/addresses';
import {
  ExecuteViaKeyManager,
  ExecuteViaUniversalProfile,
  IBlockchainTransactionHookOptions,
} from '../../utility/types';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import { Address } from '../../utils/types';
import { encodeTxDataForUniversalProfileExecuteCall } from '../../utils/universalProfile';

interface IFuncParams {
  /**
   * the amount for which the nft will be listed for sale
   */
  price: number;
  /**
   * the erc20 token that is whitelisted to be accepted for buy or sell
   */
  acceptedToken: Address;
  /**
   * how to execute a blockchain call based on universal profile owner ship
   */
  executeVia: ExecuteViaUniversalProfile | ExecuteViaKeyManager;
}

interface ISetForSale {
  /**
   * function to propagate the transaction on blockchain
   */
  setForSale: (funcParams: IFuncParams) => void;
  /**
   * state of the blockchain transaction
   */
  isTransacting: boolean;
  /**
   * state of the set for sale
   */
  isSetForSale: boolean;
  error: string | null;
}

interface IHookParams {
  /**
   * the address of nft's on blockchain
   */
  lsp8Address: Address;
  /**
   * the token/mint number of the nft that needs to be set on sale
   */
  mintNumber: number;
  network: NetworkName;
}

/**
 * custom hook for setting the nft for sale on blockchain
 *
 * @param hookParams
 * @param hookParams.lsp8Address
 * @param hookParams.mintNumber
 * @param hookParams.network
 * @param options
 */
export const useSetForSale = (
  hookParams: IHookParams,
  {
    onMutate,
    onTransaction,
    onSuccess,
    onError,
  }: IBlockchainTransactionHookOptions<IHookParams & IFuncParams> = {},
): ISetForSale => {
  const { lsp8Address, mintNumber, network } = hookParams;

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [isSetForSale, setIsSetForSale] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: signer } = useSigner();

  const setForSale = async (funcParams: IFuncParams): Promise<void> => {
    const { price, acceptedToken, executeVia } = funcParams;

    setError(null);
    setIsTransacting(true);

    if (!signer) {
      setIsTransacting(false);
      setError('wallet not connected');
      return;
    }

    try {
      const universalProfileContract = UniversalProfileProxy__factory.connect(
        executeVia.upAddress,
        signer as Signer,
      );
      const cardTokenContract = CardTokenProxy__factory.connect(
        lsp8Address,
        signer as Signer,
      );
      const tokenIdBytes = tokenIdAsBytes32(mintNumber);
      const convertedPrice = (
        price *
        10 ** WHITE_LISTED_TOKENS[network][acceptedToken.toLowerCase()].decimals
      ).toFixed(0);

      const encodedSetMarketFor =
        cardTokenContract.interface.encodeFunctionData('setMarketFor', [
          tokenIdBytes,
          acceptedToken,
          convertedPrice,
        ]);

      if (executeVia.type === 'Key_Manager') {
        const encodedExecute = encodeTxDataForUniversalProfileExecuteCall(
          universalProfileContract,
          lsp8Address,
          encodedSetMarketFor,
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
          throw new Error('Transaction Reverted');

        setIsSetForSale(true);
        setIsTransacting(false);

        onSuccess &&
          onSuccess({ ...hookParams, ...funcParams }, minedTransaction);

        return;
      }

      onMutate && onMutate({ ...hookParams, ...funcParams });

      //   const transaction = await executeCallViaUniversalProfile(
      //     { gasLimit: TX_GAS_LIMIT },
      //     universalProfileContract,
      //     lsp8Address,
      //     encodedSetMarketFor,
      //   );

      const transaction = await universalProfileContract.execute(
        '0x0',
        lsp8Address,
        0,
        encodedSetMarketFor,
      );

      onTransaction &&
        onTransaction({ ...hookParams, ...funcParams }, transaction);

      const minedTransaction = await transaction.wait(TX_WAIT_BLOCKS);

      if (minedTransaction.status === 0)
        throw new Error('Transaction Reverted');

      setIsSetForSale(true);

      onSuccess &&
        onSuccess({ ...hookParams, ...funcParams }, minedTransaction);
    } catch (error) {
      setError((error as Error).message);

      onError && onError(error as Error);
    }

    setIsTransacting(false);
  };

  return { setForSale, isTransacting, isSetForSale, error };
};
