import React, { useState } from 'react';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import {
  StyledInput,
  StyledInputRow,
  StyledLabel,
} from '../ProfileEditModal/styles';
import { StyledSelectInput, StyledTransferCardModalContent } from './styles';
import { Address } from '../../../utils/types';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { IOwnedAssets } from '../../../services/models';

interface IProps {
  profile: {
    address: Address;
    owner: Address;
    isOwnerKeyManager: boolean;
    ownedAssets: IOwnedAssets[];
  };
  onDismiss: () => void;
}

type formInput = {
  toAddress: string;
  cardAddress: string;
  tokenId: number | null;
};

export const TransferCardsModal: React.FC<IProps> = ({
  profile,
  onDismiss,
}: IProps) => {
  const [transferCardForm, setTransferCardForm] = useState<formInput>({
    toAddress: '',
    cardAddress: '',
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

  const { transferCard, transferState, error } = useTransferLsp8Token(
    transferCardForm.cardAddress,
    transferCardForm.toAddress,
    transferCardForm.tokenId,
    profile,
  );

  const fields = [
    { name: 'toAddress', label: 'To', type: 'text' },
    { name: 'cardAddress', label: 'Card Name', type: 'select' },
    { name: 'tokenId', label: 'Token Id', type: 'select' },
  ];

  return (
    <StyledTransferCardModalContent>
      {fields.map((item, key) => (
        <StyledInputRow key={key}>
          <StyledLabel htmlFor={item.name}>{item.label}</StyledLabel>
          {item.type === 'text' && (
            <StyledInput
              id={item.name}
              name={item.name}
              type={item.type}
              onChange={changeHandler}
            />
          )}
          {item.type === 'select' && item.name === 'cardAddress' && (
            <StyledSelectInput
              name={item.name}
              onChange={changeHandler}
              defaultValue={profile.ownedAssets[0].assetAddress}
            >
              <option>Token address</option>
              {profile.ownedAssets.map((ownedAsset, key) => (
                <option
                  key={key}
                  value={ownedAsset.assetAddress}
                  defaultValue={ownedAsset.assetAddress}
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
                    ownedAsset.assetAddress === transferCardForm.cardAddress,
                )
                ?.tokenIds.map((tokenId, key) => (
                  <option key={key} value={tokenId}>
                    {tokenId}
                  </option>
                ))}
            </StyledSelectInput>
          )}
        </StyledInputRow>
      ))}
      <StyledModalButtonsWrapper>
        <StyledModalButton onClick={transferCard}>
          Transfer Card
        </StyledModalButton>
      </StyledModalButtonsWrapper>
    </StyledTransferCardModalContent>
  );
};
