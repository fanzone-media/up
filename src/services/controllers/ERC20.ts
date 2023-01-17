/* eslint-disable react-hooks/rules-of-hooks */
import { BigNumberish, ethers, Signer } from 'ethers';
import { erc20ABI } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { useRpcProvider } from '../../hooks';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { Address } from '../../utils/types';

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

export const ERC20Api = {
  encodeTransfer,
  encodeApprove,
  fetchErc20TokenInfo,
};
