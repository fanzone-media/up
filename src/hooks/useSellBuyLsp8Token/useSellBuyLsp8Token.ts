import { BigNumber } from 'ethers';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../boot/types';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';

export const useSellBuyLsp8Token = (
  assetAddress: string,
  network: NetworkName,
) => {
  const [{ data: signer }] = useSigner();

  const buyFromMarket = async (
    universalProfileAddress: string,
    assetAddress: string,
    amount: BigNumber,
    tokenId: number,
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
    const keyManagerCheck =
      owner && (await LSP3ProfileApi.checkKeyManager(owner, network));
    if (keyManagerCheck && owner) {
      signer &&
        (await KeyManagerApi.buyFromCardMarketViaKeyManager(
          assetAddress,
          owner,
          universalProfileAddress,
          tokenId,
          amount,
          signer,
        ));
    }
  };

  return { buyFromMarket };
};
