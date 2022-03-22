import { ethers, Signer } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { LSP3ProfileApi } from '../../../services/controllers/LSP3Profile';
import { IProfile } from '../../../services/models';
import { StyledLoader, StyledLoadingHolder } from '../../AssetDetails/styles';
import {
  StyledErrorLoadingContent,
  StyledErrorText,
  StyledInput,
  StyledInputRow,
  StyledLabel,
  StyledLoadingMessage,
  StyledSaveButton,
} from '../ProfileEditModal/styles';
import { StyledSelectInput, StyledTransferCardModalContent } from './styles';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  signer: Signer;
  profile: IProfile;
  selectecAddress?: string;
}

type formInput = {
  toAddress: string;
  cardAddress: string;
  tokenId: number | null;
};

export const TransferCardModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  signer,
  profile,
  selectecAddress,
}: IProps) => {
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [transferCardForm, setTransferCardForm] = useState<formInput>({
    toAddress: '',
    cardAddress: selectecAddress ? selectecAddress : '',
    tokenId: null,
  });

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (
      event.currentTarget.name === 'cardAddress' &&
      event.currentTarget.value !== transferCardForm.cardAddress
    ) {
      setTransferCardForm({
        ...transferCardForm,
        [event.currentTarget.name]: event.currentTarget.value,
        tokenId: null,
      });
    } else {
      setTransferCardForm({
        ...transferCardForm,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const tranferCard = async () => {
    setLoading(true);
    if (profile.isOwnerKeyManager) {
      await LSP3ProfileApi.transferCardViaKeyManager(
        transferCardForm.cardAddress,
        profile.address,
        profile.owner,
        transferCardForm.tokenId ? transferCardForm.tokenId : 0,
        transferCardForm.toAddress,
        signer,
      )
        .then(() => {
          onClose();
          window.location.reload();
        })
        .catch((error) => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      await LSP3ProfileApi.transferCardViaUniversalProfile(
        transferCardForm.cardAddress,
        profile.address,
        transferCardForm.tokenId ? transferCardForm.tokenId : 0,
        transferCardForm.toAddress,
        signer,
      )
        .then(() => {
          onClose();
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const disabledTransfer = () => {
    if (
      transferCardForm.tokenId &&
      ethers.utils.isAddress(transferCardForm.toAddress) &&
      ethers.utils.isAddress(transferCardForm.cardAddress)
    ) {
      return false;
    } else {
      return true;
    }
  };

  const extendedClose = () => {
    setError(false);
    onClose();
  };

  useEffect(() => {
    console.log(selectecAddress);
  }, [selectecAddress]);

  const fields = [
    { name: 'toAddress', label: 'To', type: 'text' },
    { name: 'cardAddress', label: 'Card Name', type: 'select' },
    { name: 'tokenId', label: 'Token Id', type: 'select' },
  ];

  return isOpen ? (
    <Modal heading="Transfer Cards" onClose={extendedClose}>
      {!loading && !error ? (
        <StyledTransferCardModalContent>
          {fields.map((item, i) => (
            <StyledInputRow key={i}>
              <StyledLabel>{item.label}</StyledLabel>
              {item.type === 'text' && (
                <StyledInput
                  name={item.name}
                  type={item.type}
                  onChange={changeHandler}
                />
              )}
              {item.type === 'select' && item.name === 'cardAddress' && (
                <StyledSelectInput name={item.name} onChange={changeHandler}>
                  <option>Select token address</option>
                  {profile.ownedAssets.map((ownedAsset) => (
                    <option
                      selected={ownedAsset.assetAddress === selectecAddress}
                      key={ownedAsset.assetAddress}
                      value={ownedAsset.assetAddress}
                    >
                      {ownedAsset.assetAddress}
                    </option>
                  ))}
                </StyledSelectInput>
              )}
              {item.type === 'select' && item.name === 'tokenId' && (
                <StyledSelectInput name={item.name} onChange={changeHandler}>
                  <option>Select token id</option>
                  {profile.ownedAssets
                    .find(
                      (ownedAsset) =>
                        ownedAsset.assetAddress ===
                        transferCardForm.cardAddress,
                    )
                    ?.tokenIds.map((tokenId) => (
                      <option key={tokenId} value={tokenId}>
                        {tokenId}
                      </option>
                    ))}
                </StyledSelectInput>
              )}
            </StyledInputRow>
          ))}
          <StyledSaveButton onClick={tranferCard} disabled={disabledTransfer()}>
            Transfer Card
          </StyledSaveButton>
        </StyledTransferCardModalContent>
      ) : (
        <StyledErrorLoadingContent>
          {!error ? (
            <>
              <StyledLoadingHolder>
                <StyledLoader color="#ed7a2d" />
              </StyledLoadingHolder>
              <StyledLoadingMessage>
                confirm the metamask transaction and wait for transaction
                success....
              </StyledLoadingMessage>
            </>
          ) : (
            <StyledErrorText>Something went wrong</StyledErrorText>
          )}
        </StyledErrorLoadingContent>
      )}
    </Modal>
  ) : (
    <></>
  );
};
