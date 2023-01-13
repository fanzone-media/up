import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSigner } from 'wagmi';
import { NetworkName, RootState } from '../../boot/types';
import { selectCardById } from '../../features/cards';
import { selectUserById } from '../../features/profiles';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';

export const useAuthorizeOperator = (
  assetAddress: Address,
  operatorAddress: Address,
  upAddress: Address,
  tokenId: number,
  network: NetworkName,
) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authorizingState, setAuthorizingState] = useState<STATUS>(STATUS.IDLE);

  const asset = useSelector((state: RootState) =>
    selectCardById(state.cards[network], assetAddress),
  );
  const profile = useSelector((state: RootState) =>
    selectUserById(state.userData[network], upAddress),
  );

  const [{ data: signer }] = useSigner();

  useEffect(() => {
    getIsOperator();
  }, []);

  const getIsOperator = async () => {
    if (!asset) return;

    try {
      const isOpearator =
        asset.supportedInterface === 'erc721'
          ? await LSP4DigitalAssetApi.fetchIsApprovedErc721(
              assetAddress,
              operatorAddress,
              tokenId,
              network,
            )
          : await LSP4DigitalAssetApi.fetchIsOperatorFor(
              assetAddress,
              operatorAddress,
              tokenId,
              network,
            );

      setIsAuthorized(isOpearator);
    } catch (error) {
      return;
    }
  };

  const authorizeOperator = async () => {
    if (!signer || !asset || !profile) return;

    setAuthorizingState(STATUS.LOADING);
    try {
      const encodedAuthorizeOperator =
        asset.supportedInterface === 'erc721'
          ? LSP4DigitalAssetApi.encodeApproveErc721(
              assetAddress,
              operatorAddress,
              signer,
              tokenId,
            )
          : LSP4DigitalAssetApi.encodeAuthorizeOperator(
              assetAddress,
              operatorAddress,
              signer,
              tokenId,
            );

      if (profile.isOwnerKeyManager) {
        const encodedExecuteData = LSP3ProfileApi.encodeExecute(
          profile.address,
          assetAddress,
          encodedAuthorizeOperator,
          signer,
        );

        await KeyManagerApi.executeTransactionViaKeyManager(
          profile.owner,
          encodedExecuteData,
          signer,
        );

        setIsAuthorized(true);
        setAuthorizingState(STATUS.SUCCESSFUL);
        return;
      }

      await LSP3ProfileApi.executeTransactionViaUniversalProfile(
        profile.address,
        assetAddress,
        encodedAuthorizeOperator,
        signer,
      );

      setIsAuthorized(true);
      setAuthorizingState(STATUS.SUCCESSFUL);
    } catch (error) {
      setAuthorizingState(STATUS.FAILED);
    }
  };

  return { isAuthorized, authorizingState, authorizeOperator };
};
