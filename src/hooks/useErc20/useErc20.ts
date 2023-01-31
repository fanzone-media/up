import { BigNumber, Signer } from 'ethers';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useNetwork, useSigner } from 'wagmi';
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
  const { data: signer } = useSigner();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const [error, setError] = useState();
  const [approveError, setApproveError] = useState<string>();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const provider = useRpcProvider(network);
  const erc20Contract = useMemo(
    () =>
      ERC20__factory.connect(
        tokenAddress,
        signer ? (signer as Signer) : provider,
      ),
    [provider, signer, tokenAddress],
  );

  const approve = async (
    spenderAddress: string,
    amount: number,
    network: NetworkName,
    universalProfileAddress?: string,
  ) => {
    if (chain?.name.toLowerCase() !== network) {
      toast('Wrong Network', { type: 'error', position: 'top-right' });
      return;
    }

    const buyer = universalProfileAddress
      ? universalProfileAddress
      : account
      ? account
      : '';

    const balance = await checkBalanceOf(buyer);

    if (balance < amount) {
      setApproveError('Not enough balance');
      return;
    }

    const allowance = await checkAllowance(buyer, spenderAddress);

    if (allowance && allowance.toNumber() >= amount) {
      setIsApproved(true);
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
          signer as Signer,
        )
          .then(() => {
            setIsApproved(true);
          })
          .catch((err) => {
            setError(err);
          }));
    }
    if (owner && universalProfileAddress) {
      signer &&
        (await LSP3ProfileApi.approveTokenViaUniversalProfile(
          universalProfileAddress,
          spenderAddress,
          tokenAddress,
          amount,
          signer as Signer,
        )
          .then(() => {
            setIsApproved(true);
          })
          .catch((err) => {
            setError(err);
          }));
    } else {
      await erc20Contract
        .approve(spenderAddress, amount)
        .then(() => {
          setIsApproved(true);
        })
        .catch((err) => {
          setError(err);
        });
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

  const checkBalanceOf = async (address: string): Promise<number> => {
    const balance = await erc20Contract.balanceOf(address);
    return balance.toNumber();
  };

  const resetApproveState = () => {
    setIsApproved(false);
    setApproveError(undefined);
  };

  return {
    approve,
    checkAllowance,
    checkBalanceOf,
    isApproved,
    resetApproveState,
    approveError,
  };
};
