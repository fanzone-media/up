import { Account, TransactionReceipt } from 'web3-core';
import { Contract, ContractInterface } from 'ethers';
import { Provider } from '@ethersproject/providers';

export interface IEthereumService {
  loadAccount: (privateKey: string) => Account;

  getContract: (
    jsonInterface: ContractInterface,
    address: string,
    network: string,
  ) => Contract;

  getProvider: (network: string) => Provider;

  sendSignedTransaction: (
    address: string,
    data: string,
  ) => Promise<TransactionReceipt>;

  deployBytecode: (bytecode: string) => Promise<string>;
}
