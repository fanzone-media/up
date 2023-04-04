import { ContractReceipt, ContractTransaction } from 'ethers';
import { Address } from '../utils/types';

export type ExecuteViaKeyManager = {
  type: 'Key_Manager';
  upAddress: Address;
  upOwnerAddress: Address;
};

export type ExecuteViaUniversalProfile = {
  type: 'Universal_Profile';
  upAddress: Address;
};

export type ExecuteViaEOA = {
  type: 'Eoa';
};

export interface IBlockchainTransactionHookOptions<T> {
  /**
   * callback fires before the transaction starts
   */
  onMutate?: (params: T) => void;
  /**
   * callback fires after the transaction is signed and sent on the blockchain
   */
  onTransaction?: (params: T, transactionResponse: ContractTransaction) => void;
  /**
   * callback fires when the transaction is successfull on the blockchain
   */
  onSuccess?: (params: T, transactionReceipt: ContractReceipt) => void;
  /**
   * callback fires if any error occurs
   */
  onError?: (error: Error) => void;
}
