import { BigNumberish } from 'ethers';
import { useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IProfile } from '../../services/models';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { Address } from '../../utils/types';
import { useRpcProvider } from '../useRpcProvider';

export const useWitdrawFunds = (network: NetworkName) => {
  const [{ data: signer }] = useSigner();
  const [error, setError] = useState();
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const provider = useRpcProvider(network);

  const balanceOf = async (
    tokenAddresses: Address[],
    profieAddress: Address,
  ) => {
    const balances = await Promise.all(
      tokenAddresses.map(async (address) => {
        const tokenContract = ERC20__factory.connect(address, provider);
        const balance = await tokenContract.balanceOf(profieAddress);
        return {
          address,
          balance,
        };
      }),
    );
    return balances;
  };

  const withdrawFunds = async (
    profile: IProfile,
    tokenAddress: Address,
    toAddress: Address,
    amount: BigNumberish,
  ) => {
    setIsWithdrawing(true);
    if (profile.isOwnerKeyManager) {
      signer &&
        (await KeyManagerApi.transferBalanceViaKeyManager(
          tokenAddress,
          profile.owner,
          profile.address,
          amount,
          toAddress,
          signer,
        )
          .catch((error) => {
            setError(error);
          })
          .finally(() => {
            setIsWithdrawing(false);
          }));
    } else {
      signer &&
        LSP3ProfileApi.transferBalanceViaUniversalProfile(
          tokenAddress,
          profile.address,
          amount,
          toAddress,
          signer,
        )
          .catch((error) => {
            setError(error);
          })
          .finally(() => {
            setIsWithdrawing(false);
          });
    }
  };

  return {
    balanceOf,
    withdrawFunds,
    isWithdrawing,
    error,
  };
};
