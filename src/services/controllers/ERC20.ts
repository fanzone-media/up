import { BigNumberish, Signer } from 'ethers';
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

export const ERC20Api = {
  encodeTransfer,
  encodeApprove,
};
