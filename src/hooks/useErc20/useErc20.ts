import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
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
  const [{ data: account }] = useAccount();
  const [error, setError] = useState();
  const provider = useRpcProvider(network);
  const erc20Contract = useMemo(
    () => ERC20__factory.connect(tokenAddress, signer ? signer : provider),
    [provider, signer, tokenAddress],
  );

  const approve = async (
    spenderAddress: string,
    amount: BigNumber,
    network: NetworkName,
    universalProfileAddress?: string,
  ) => {
    const buyer = universalProfileAddress
      ? universalProfileAddress
      : account
      ? account.address
      : '';

    const balance = await checkBalanceOf(buyer);

    const allowance =
      balance >= amount && (await checkAllowance(buyer, spenderAddress));
    if (allowance && allowance >= amount) {
      return;
    }

    const universalProfileCheck =
      universalProfileAddress &&
      (await LSP3ProfileApi.isUniversalProfile(
        universalProfileAddress,
        network,
      ));
    const owner =
      universalProfileAddress &&
      universalProfileCheck &&
      (await LSP3ProfileApi.fetchOwnerOfProfile(
        universalProfileAddress,
        network,
      ));

    const keyManagerCheck =
      owner && (await LSP3ProfileApi.checkKeyManager(owner, network));
    if (keyManagerCheck && owner && universalProfileAddress) {
      signer &&
        (await KeyManagerApi.approveTokenViaKeyManager(
          owner,
          universalProfileAddress,
          spenderAddress,
          tokenAddress,
          amount,
          signer,
        ));
    }
    if (owner && universalProfileAddress) {
      signer &&
        (await LSP3ProfileApi.approveTokenViaUniversalProfile(
          universalProfileAddress,
          spenderAddress,
          tokenAddress,
          amount,
          signer,
        ));
    } else {
      await erc20Contract.approve(spenderAddress, amount);
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
