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

  const approve = async (
    universalProfileAddress: string,
    spenderAddress: string,
    amount: BigNumber,
    network: NetworkName,
  ) => {
    const universalProfileCheck = await LSP3ProfileApi.isUniversalProfile(
      universalProfileAddress,
      network,
    );
    const owner =
      universalProfileCheck &&
      (await LSP3ProfileApi.fetchOwnerOfProfile(
        universalProfileAddress,
        network,
      ));
    const balance = await checkBalanceOf(universalProfileAddress);
    const allowance =
      balance >= amount &&
      (await checkAllowance(universalProfileAddress, spenderAddress));
    if (allowance && allowance >= amount) {
      return;
    }
    const keyManagerCheck =
      owner && (await LSP3ProfileApi.checkKeyManager(owner, network));
    if (keyManagerCheck && owner) {
      signer &&
        (await KeyManagerApi.approveTokenViaKeyManager(
          owner,
          universalProfileAddress,
          spenderAddress,
          tokenAddress,
          amount,
          signer,
        ));
    } else {
      signer &&
        (await LSP3ProfileApi.approveTokenViaUniversalProfile(
          universalProfileAddress,
          spenderAddress,
          tokenAddress,
          amount,
          signer,
        ));
    }
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
    approve,
    checkAllowance,
    checkBalanceOf,
  };
};
