/* eslint-disable react-hooks/rules-of-hooks */
import { BigNumberish, ethers, Signer } from 'ethers';
import { erc20ABI } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { useRpcProvider } from '../../hooks';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { Address } from '../../utils/types';

export type Erc20MetaData = {
  /**
   * name of the erc20 token contract
   */
  name: string;
  /**
   * symbol of the erc20 token
   */
  symbol: string;
  /**
   * number of decimal places the erc20 token has
   */
  decimals: number;
};

export type Erc20Balance = Erc20MetaData & {
  /**
   * amount of erc20 tokens owned by an address
   */
  balance: number;
  /**
   * amount of erc20 tokens owned by an address as float
   */
  formatted: number;
};

export type Erc20Allowance = Erc20MetaData & {
  /**
   * amount of erc20 tokens allowed to be spent by an address
   */
  allowance: number;
  /**
   * amount of erc20 tokens allowed to be spent by an address as float
   */
  formatted: number;
};

const encodeTransfer = (
  tokenAddress: Address,
  amountToTransfer: BigNumberish,
  toAddress: Address,
  signer: Signer,
): string => {
  const tokenContract = ERC20__factory.connect(tokenAddress, signer);
  const encodedTransfer = tokenContract.interface.encodeFunctionData(
    'transfer',
    [toAddress, amountToTransfer],
  );

  return encodedTransfer;
};

const encodeApprove = (
  spenderAddress: Address,
  tokenAddress: Address,
  amount: BigNumberish,
  signer: Signer,
): string => {
  const erc20Contract = ERC20__factory.connect(tokenAddress, signer);
  const encodedApprove = erc20Contract.interface.encodeFunctionData('approve', [
    spenderAddress,
    amount.toString(),
  ]);
  return encodedApprove;
};

const fetchErc20TokenInfo = async (address: string, network: NetworkName) => {
  const provider = useRpcProvider(network);
  const contract = new ethers.Contract(address, erc20ABI, provider);
  const [symbol, decimals] = await Promise.all([
    contract.symbol(),
    contract.decimals(),
  ]);
  return {
    tokenAddress: address,
    symbol: symbol as string,
    decimals: decimals as number,
  };
};

const getErc20MetaData = async (
  tokenAddress: Address,
  network: NetworkName,
): Promise<Erc20MetaData> => {
  const provider = useRpcProvider(network);
  const contract = ERC20__factory.connect(tokenAddress, provider);
  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
  ]);

  return { name, symbol, decimals };
};

const getErc20Balance = async (
  tokenAddress: Address,
  holderAddress: Address,
  network: NetworkName,
): Promise<Erc20Balance> => {
  const provider = useRpcProvider(network);
  const contract = ERC20__factory.connect(tokenAddress, provider);
  const [balance, metaData] = await Promise.all([
    contract.balanceOf(holderAddress),
    getErc20MetaData(tokenAddress, network),
  ]);

  const formatted = Number(balance.toString()) / 10 ** metaData.decimals;

  return { balance: Number(balance.toString()), formatted, ...metaData };
};

const getErc20Allowance = async (
  tokenAddress: Address,
  holderAddress: Address,
  spender: Address,
  network: NetworkName,
): Promise<Erc20Allowance> => {
  const provider = useRpcProvider(network);
  const contract = ERC20__factory.connect(tokenAddress, provider);
  const [allowance, metaData] = await Promise.all([
    contract.allowance(holderAddress, spender),
    getErc20MetaData(tokenAddress, network),
  ]);
  const formatted = Number(allowance.toString()) / 10 ** metaData.decimals;

  return { allowance: Number(allowance.toString()), formatted, ...metaData };
};

export const ERC20Api = {
  encodeTransfer,
  encodeApprove,
  fetchErc20TokenInfo,
  getErc20MetaData,
  getErc20Balance,
  getErc20Allowance,
};
