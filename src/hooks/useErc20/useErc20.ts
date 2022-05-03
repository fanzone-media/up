import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { useRpcProvider } from '../useRpcProvider';

interface IProps {
  tokenAddress: string;
  network: NetworkName;
}

export const useErc20 = ({ tokenAddress, network }: IProps) => {
  const [{ data: signer }] = useSigner();
  const provider = useRpcProvider(network);
  const erc20Contract = useMemo(
    () => ERC20__factory.connect(tokenAddress, signer ? signer : provider),
    [provider, signer, tokenAddress],
  );

  const approveViaUniversalProfile = async (
    universalProfileAddress: string,
    spenderAddress: string,
    amount: BigNumber,
  ) => {
    signer &&
      (await LSP3ProfileApi.approveTokenViaUniversalProfile(
        universalProfileAddress,
        spenderAddress,
        tokenAddress,
        amount,
        signer,
      ));
  };

  const approveViaKeyManager = async (
    keyManagerAddress: string,
    universalProfileAddress: string,
    spenderAddress: string,
    amount: BigNumber,
  ) => {
    signer &&
      (await KeyManagerApi.approveTokenViaKeyManager(
        keyManagerAddress,
        universalProfileAddress,
        spenderAddress,
        tokenAddress,
        amount,
        signer,
      ));
  };

  const checkAllowance = async (
    ownerAddress: string,
    spenderAddress: string,
  ): Promise<BigNumber> => {
    const allowance = await erc20Contract.allowance(
      ownerAddress,
      spenderAddress,
    );
    return allowance;
  };

  const checkBalanceOf = async (address: string): Promise<BigNumber> => {
    const balance = await erc20Contract.balanceOf(address);
    return balance;
  };

  return {
    approveViaUniversalProfile,
    approveViaKeyManager,
    checkAllowance,
    checkBalanceOf,
  };
};
