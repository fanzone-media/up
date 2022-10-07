import { BigNumber, BigNumberish, Signer } from 'ethers';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';

const encodeTransfer = (
  tokenAddress: string,
  amountToTransfer: BigNumberish,
  toAddress: string,
  signer: Signer,
) => {
  const tokenContract = ERC20__factory.connect(tokenAddress, signer);
  const encodedTransfer = tokenContract.interface.encodeFunctionData(
    'transfer',
    [toAddress, amountToTransfer],
  );

  return encodedTransfer;
};

const encodeApprove = (
  spenderAddress: string,
  tokenAddress: string,
  amount: BigNumber,
  signer: Signer,
) => {
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
