import { BigNumberish, Signer } from 'ethers';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSigner, useNetwork } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IProfile } from '../../services/models';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
import { useRpcProvider } from '../useRpcProvider';

export const useWitdrawFunds = (network: NetworkName) => {
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const [error, setError] = useState();
  const [withdrawState, setWithdrawState] = useState<STATUS>(STATUS.IDLE);
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
    if (chain?.name !== network) {
      toast('Wrong Network', { type: 'error', position: 'top-right' });
      return;
    }
    setWithdrawState(STATUS.LOADING);
    if (profile.isOwnerKeyManager) {
      signer &&
        (await KeyManagerApi.transferBalanceViaKeyManager(
          tokenAddress,
          profile.owner,
          profile.address,
          amount,
          toAddress,
          signer as Signer,
        )
          .then(() => {
            setWithdrawState(STATUS.SUCCESSFUL);
          })
          .catch((error) => {
            setError(error);
            setWithdrawState(STATUS.FAILED);
          }));
    } else {
      signer &&
        (await LSP3ProfileApi.transferBalanceViaUniversalProfile(
          tokenAddress,
          profile.address,
          amount,
          toAddress,
          signer as Signer,
        )
          .then(() => {
            setWithdrawState(STATUS.SUCCESSFUL);
          })
          .catch((error) => {
            setError(error);
            setWithdrawState(STATUS.FAILED);
          }));
    }
  };

  return {
    balanceOf,
    withdrawFunds,
    withdrawState,
    error,
    resetState: () => setWithdrawState(STATUS.IDLE),
  };
};
