import KeyChain from './utilities/KeyChain';

import Web3 from 'web3';
import { ethers, Contract, ContractInterface } from 'ethers';
import { Transaction } from '@ethereumjs/tx';
import buffer from 'buffer';
import { IEthereumService } from './IEthereumService';
import { Account, TransactionReceipt } from 'web3-core';
import { Provider } from '@ethersproject/providers';

export default class Web3Service implements IEthereumService {
  /**
   * Lukso Constants
   * @constant {string} PROVIDER_URL The Lukso network rpc url
   */
  // static PROVIDER_URL  = 'http://34.120.18.166:80/'
  static LUKSO_L14_PROVIDER_URL = 'https://rpc.l14.lukso.network';
  static POLYGON_MAINNET_PROVIDER_URL = 'https://polygon-rpc.com/';
  static POLYGON_MUMBAI_PROVIDER_URL =
    'https://rpc-mumbai.maticvigil.com';
  static ETHEREUM_MAINNET_PROVIDER_URL = '';

  /**
   * Fanzone Service Constants
   * @constant {string} FACTORY_ADDR The factory contract address
   * @constant {number} CHAIN_ID The rpc chain id
   * @constant {number} RELAYER_GAS The maximum gas provided for this transaction (gas limit).
   * @constant {number} RELAYER_GAS_PRICE The gas price in wei to use for this transaction
   * @constant {number} TRANSACTION_GAS The maximum gas provided for this transaction (gas limit).
   * @constant {number} TRANSACTION_GAS_PRICE The gas price in wei to use for this transaction
   */
  static FACTORY_ADDR = '0xa388CB5868E9f2a4948B85fE854061045a8C5A7E';
  static DIGITAL_CARD_ADDR = '0x86eFd31C047040DFFf87cD9488317F04F7E6D465';
  static CHAIN_ID = 22;
  static RELAYER_GAS = 8000000;
  static RELAYER_GAS_PRICE = '5000000000';

  //static TRANSACTION_GAS       = 500000
  static TRANSACTION_GAS = 50000000;
  static TRANSACTION_GAS_PRICE = 2000000000;

  /**
   * Relayer Constants - don't steal us please :D
   * @constant {string} RELAYER_ADDR The wallet account addr
   * @constant {string} RELAYER_PK The wallet account pk
   */
  static RELAYER_ADDR = '0xD810Fa13696f40fb822238A84DF23b99eA74c807';
  static RELAYER_PK =
    '0xa6349a3b9c866f6b475ecfe8e594a814e54d30f5cf50f9139786e2b8f92a6e46';

  static LUKSO_L14_PROVIDER = new ethers.providers.JsonRpcProvider(
    Web3Service.LUKSO_L14_PROVIDER_URL,
  );
  static POLYGON_MAINNET_PROVIDER = new ethers.providers.JsonRpcProvider(
    Web3Service.POLYGON_MAINNET_PROVIDER_URL,
  );
  static POLYGON_MUMBAI_PROVIDER = new ethers.providers.JsonRpcProvider(
    Web3Service.POLYGON_MUMBAI_PROVIDER_URL,
  );
  static ETHEREUM_MAINNET_PROVIDER = new ethers.providers.JsonRpcProvider(
    Web3Service.ETHEREUM_MAINNET_PROVIDER_URL,
  );

  static web3 = new Web3(
    new Web3.providers.HttpProvider(Web3Service.LUKSO_L14_PROVIDER_URL),
  );
  static KeyChain = KeyChain;

  relayer: any;
  factoryContract: any;

  constructor() {
    this.relayer = Web3Service.web3.eth.accounts.wallet.add({
      privateKey: Web3Service.RELAYER_PK,
      address: Web3Service.RELAYER_ADDR,
    });
  }

  /**
   * initRelayer
   *
   * Adds an account using a private key to the wallet
   * Creates an object that holds transactions pramaeters
   *
   * @return
   */
  initRelayer() {
    /** Adds an account using a private key to the wallet */
  }

  /**
   * initFactory
   *
   * Creates a new instance to the factory contract
   *
   * @return
   */

  loadAccount(privateKey: string): Account {
    return Web3Service.web3.eth.accounts.privateKeyToAccount(privateKey);
  }

  getProvider(network: string): Provider {
    if (network === 'mumbai') return Web3Service.POLYGON_MUMBAI_PROVIDER;
    if (network === 'polygon') return Web3Service.POLYGON_MAINNET_PROVIDER;
    if (network === 'ethereum') return Web3Service.ETHEREUM_MAINNET_PROVIDER;
    if (network === 'l14') {
      return Web3Service.LUKSO_L14_PROVIDER;
    }
    return Web3Service.POLYGON_MUMBAI_PROVIDER;
  }

  getContract(
    jsonInterface: ContractInterface,
    address: string,
    network: string,
  ): Contract {
    if (network === 'mumbai')
      return new ethers.Contract(
        address,
        jsonInterface,
        Web3Service.POLYGON_MUMBAI_PROVIDER,
      );
    if (network === 'polygon')
      return new ethers.Contract(
        address,
        jsonInterface,
        Web3Service.POLYGON_MAINNET_PROVIDER,
      );
    if (network === 'ethereum')
      return new ethers.Contract(
        address,
        jsonInterface,
        Web3Service.ETHEREUM_MAINNET_PROVIDER,
      );
    else {
      return new ethers.Contract(
        address,
        jsonInterface,
        Web3Service.LUKSO_L14_PROVIDER,
      );
    }
  }

  /**
   * sendSignedTransaction
   *
   * Creates a transaction instance and sends the input data to the given address. The transaction is
   * sign with the relayer pk.
   *
   * @param {string} address - Destination address '0x00000...'
   * @param {string} data - The encoded data in an hex string '0x58cf5f10000000000000000000000000007B'
   *
   * @return {Promise<Block|null>} The receipt block created by the transaction or null if an error ocurred.
   *
   * @example Block
   *
   *  const receipt = {
   *      "blockHash": "0xc477c15e1b09c3b461ec58b54058552ea720ff0f5ae30922fce4b244d9d2ff5d",
   *      "blockNumber": 7963519,
   *      "contractAddress": null,
   *      "cumulativeGasUsed": 49912,
   *      "from": "0xd810fa13696f40fb822238a84df23b99ea74c807",
   *      "gasUsed": 49912,
   *      "logs": [{
   *          "address": "0x3f398D668A59aef4471329564b43ad2804D31e39",
   *          "blockHash": "0xc477c15e1b09c3b461ec58b54058552ea720ff0f5ae30922fce4b244d9d2ff5d",
   *          "blockNumber": 7963519,
   *          "data": "0x00000000000000000000000085bbc2061b0b517efdd4a48715e9464255724c70475a5363623633513346455761713764754a6f000000...",
   *          "logIndex": 0,
   *          "removed": false,
   *          "topics": [
   *              "0xece574603820d07bc9b91f2a932baadf4628aabcb8afba49776529c14a6104b2",
   *              "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"
   *          ],
   *          "transactionHash": "0xb98cf7b4e5a49a1fcba0a07575ce86eba9ad10ea86c1d3a0a8a81740ad42bd8f",
   *          "transactionIndex": 0,
   *          "transactionLogIndex": "0x0",
   *          "type": "mined",
   *          "id": "log_6c2f9055"
   *      }],
   *      "logsBloom": "0x0000000000000000800000000000000000000000000000000000000000000000000000000000000000000004000000400000000000...",
   *      "status": true,
   *      "to": "0x3f398d668a59aef4471329564b43ad2804d31e39",
   *      "transactionHash": "0xb98cf7b4e5a49a1fcba0a07575ce86eba9ad10ea86c1d3a0a8a81740ad42bd8f",
   *      "transactionIndex": 0
   *  }
   */
  sendSignedTransaction(
    address: string,
    data: string,
  ): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      let fromAddress = this.relayer.address;
      let privateKey = this.relayer.privateKey;
      /*const account     = AuthService.getAccount(); 

            if (!!account) {
                fromAddress = account.address;
                privateKey  = account.privateKey;
            }*/

      /** Get the number of transactions sent from relayer address and store it as nonce */
      let nonce = await Web3Service.web3.eth.getTransactionCount(fromAddress);

      /** Creates a new transaction instance */
      const tx = new Transaction({
        to: address,
        data: data,
        gasLimit: Web3Service.web3.utils.toHex(Web3Service.TRANSACTION_GAS),
        gasPrice: Web3Service.web3.utils.toHex(
          Web3Service.TRANSACTION_GAS_PRICE,
        ),
        nonce: Web3Service.web3.utils.toHex(nonce++),
      });

      /** sign the transaction with a relayer private key */
      tx.sign(buffer.Buffer.from(privateKey.substring(2), 'hex'));

      /** sends the sign the transaction */
      Web3Service.web3.eth
        .sendSignedTransaction(`0x${tx.serialize().toString('hex')}`)
        .on('receipt', resolve)
        .on('error', (error) => reject(error));
    });
  }

  getKeyFromArrayIndex = (origin: string, index: number) => {
    return origin.substr(0, 34) + Web3.utils.padLeft(index, 32).substr(2, 32);
  };

  generateSalt = () => {
    return Web3.utils.sha3(`${Math.floor(Math.random() * 999999999)}`);
  };

  checkSumAddress = (address: string) => {
    return Web3.utils.toChecksumAddress(address);
  };

  deployBytecode(bytecode: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let count = await Web3Service.web3.eth.getTransactionCount(
        this.relayer.address,
      );

      const salt = this.generateSalt();
      const deployResponse = await this.factoryContract.methods
        .deploy(salt, bytecode)
        .send({
          gasPrice: Web3Service.RELAYER_GAS_PRICE,
          gas: Web3Service.RELAYER_GAS,
          nonce: count++,
        });

      resolve(
        deployResponse.events['ContractCreated']['returnValues']['account'],
      );
    });
  }
}
