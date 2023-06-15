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
import {
  ExecuteViaEOA,
  ExecuteViaKeyManager,
  ExecuteViaUniversalProfile,
  IBlockchainTransactionHookOptions,
} from '../../utility/types';
import { tokenIdAsBytes32 } from '../../utils/cardToken';
import { Address } from '../../utils/types';
import { encodeTxDataForUniversalProfileExecuteCall } from '../../utils/universalProfile';

interface IFuncParams {
  /**
   * the amount for which the nft will be bought
   */
  price: number;
  /**
   * the erc20 token that is whitelisted to be accepted for buy or sell
   */
  acceptedToken: string;
  /**
   * how to execute a blockchain call based on universal profile owner ship
   */
  executeVia: ExecuteViaUniversalProfile | ExecuteViaKeyManager | ExecuteViaEOA;
}

interface IBuyFromMarket {
  /**
   * function to propagate the transaction on blockchain
   */
  buyFromMarket: (funcParams: IFuncParams) => void;
  /**
   * state of the blockchain transaction
   */
  isTransacting: boolean;
  /**
   * state of purchase
   */
  isBought: boolean;
  error: string | null;
}

interface IHookParams {
  /**
   * the address of nft's on blockchain
   */
  lsp8Address: Address;
  /**
   * the token/mint number of the nft that is being bought
   */
  mintNumber: number;
  referrer: Address;
  network: NetworkName;
}

/**
 * custom hook for buying the nft on blockchain
 *
 * @param hookParams
 * @param hookParams.lsp8Address
 * @param hookParams.mintNumber
 * @param options
 */
export const useBuyFromMarket = (
  hookParams: IHookParams,
  {
    onMutate,
    onTransaction,
    onSuccess,
    onError,
  }: IBlockchainTransactionHookOptions<IHookParams & IFuncParams> = {},
): IBuyFromMarket => {
  const { lsp8Address, mintNumber, referrer } = hookParams;

  const [isTransacting, setIsTransacting] = useState<boolean>(false);
  const [isBought, setIsBought] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: signer } = useSigner();

  const buyFromMarket = async (funcParams: IFuncParams): Promise<void> => {
    const { price, acceptedToken, executeVia } = funcParams;

    setError(null);
    setIsTransacting(true);

    if (!signer) {
      setIsTransacting(false);
      setError('wallet not connected');
      return;
    }

    try {
      const cardTokenContract = CardTokenProxy__factory.connect(
        lsp8Address,
        signer as Signer,
      );
      const tokenIdBytes = tokenIdAsBytes32(mintNumber);

      //   const convertedPrice =
      //     price * 10 ** WHITE_LISTED_TOKENS[network][acceptedToken].decimals;

      const encodedBuyFromMarket =
        cardTokenContract.interface.encodeFunctionData('buyFromMarket', [
          tokenIdBytes,
          price.toString(),
          referrer,
        ]);

      if (executeVia.type === 'Key_Manager') {
        const universalProfileContract = UniversalProfileProxy__factory.connect(
          executeVia.upAddress,
          signer as Signer,
        );

        const encodedExecute = encodeTxDataForUniversalProfileExecuteCall(
          universalProfileContract,
          lsp8Address,
          encodedBuyFromMarket,
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

        setIsBought(true);
        setIsTransacting(false);

        onSuccess &&
          onSuccess({ ...funcParams, ...hookParams }, minedTransaction);

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
        //   lsp8Address,
        //   encodedBuyFromMarket,
        // );

        const transaction = await universalProfileContract.execute(
          '0x0',
          lsp8Address,
          0,
          encodedBuyFromMarket,
        );

        onTransaction &&
          onTransaction({ ...hookParams, ...funcParams }, transaction);

        const minedTransaction = await transaction.wait(TX_WAIT_BLOCKS);

        if (minedTransaction.status === 0)
          throw new Error('Transaction Reverted');

        setIsBought(true);
        setIsTransacting(false);

        onSuccess &&
          onSuccess({ ...funcParams, ...hookParams }, minedTransaction);

        return;
      }

      onMutate && onMutate({ ...hookParams, ...funcParams });

      const transaction = await cardTokenContract.buyFromMarket(
        tokenIdBytes,
        price.toString(),
        referrer,
      );

      onTransaction &&
        onTransaction({ ...hookParams, ...funcParams }, transaction);

      const minedTransaction = await transaction.wait(TX_WAIT_BLOCKS);

      if (minedTransaction.status === 0)
        throw new Error('Transaction reverted');

      setIsBought(true);

      onSuccess &&
        onSuccess({ ...hookParams, ...funcParams }, minedTransaction);
    } catch (error) {
      setError((error as Error).message);

      onError && onError(error as Error);
    }

    setIsTransacting(false);
  };

  return { buyFromMarket, isTransacting, isBought, error };
};
