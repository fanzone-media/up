import { BigNumber, BigNumberish } from 'ethers';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IProfile } from '../../services/models';
import { LSP3AccountABI } from '../../services/utilities/ABIs/LSP3AccountABI';
import { ERC20__factory } from '../../submodules/fanzone-smart-contracts/typechain';
import { Address } from '../../utils/types';
import { useRpcProvider } from '../useRpcProvider';

export const useWitdrawFunds = (network: NetworkName) => {
  const [{ data: signer }] = useSigner();
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
    if (profile.isOwnerKeyManager) {
      signer &&
        (await KeyManagerApi.transferBalanceViaKeyManager(
          tokenAddress,
          profile.owner,
          profile.address,
          amount,
          toAddress,
          signer,
        ));
    } else {
      signer &&
        LSP3ProfileApi.transferBalanceViaUniversalProfile(
          tokenAddress,
          profile.address,
          amount,
          toAddress,
          signer,
        );
    }
  };

  return {
    balanceOf,
    withdrawFunds,
  };
};
