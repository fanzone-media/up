import { Account, TransactionReceipt } from 'web3-core';
import { Contract, ContractInterface } from 'ethers';

export interface IEthereumService {
  loadAccount: (privateKey: string) => Account;

  getContract: (
    jsonInterface: ContractInterface,
    address: string,
    network: string,
  ) => Contract;

  sendSignedTransaction: (
    address: string,
    data: string,
  ) => Promise<TransactionReceipt>;

  deployBytecode: (bytecode: string) => Promise<string>;
}
