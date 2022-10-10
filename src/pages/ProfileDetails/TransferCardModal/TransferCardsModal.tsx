import React, { useEffect, useState } from 'react';
import { ProfilePreview } from '../../AssetDetails/ProfilePreview';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { StyledInputRow, StyledLabel } from '../ProfileEditModal/styles';
import { StyledSelectInput, StyledTransferCardModalContent } from './styles';
import { Address } from '../../../utils/types';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { ICard, IOwnedAssets } from '../../../services/models';
import { InputField } from '../../../components/InputField';
import { NetworkName } from '../../../boot/types';
import { useProfile } from '../../../hooks/useProfile';

interface IProps {
  profile: {
    address: Address;
    owner: Address;
    isOwnerKeyManager: boolean;
    ownedAssets: IOwnedAssets[];
  };
  ownedCards: ICard[];
  onDismiss: () => void;
  network: NetworkName;
}

type formInput = {
  toAddress: string;
  cardAddress: string;
  tokenId: number | null;
};

export const TransferCardsModal: React.FC<IProps> = ({
  profile,
  onDismiss,
  network,
  ownedCards,
}: IProps) => {
  const [transferCardForm, setTransferCardForm] = useState<formInput>({
    toAddress: '',
    cardAddress: profile.ownedAssets[0].assetAddress,
    tokenId: null,
  });

  const [selectedCard, setSelectedCard] = useState<ICard | null>(null);

  const [
    destinationProfile,
    profileAddressError,
    getProfile,
    isProfileLoading,
  ] = useProfile();

  useEffect(() => {
    setSelectedCard(ownedCards[0]);
  }, [ownedCards]);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.currentTarget;

    if (name === 'cardAddress' || name === 'cardName') {
      const card = ownedCards.find(({ name, address }) => {
        return address === value || name === value;
      });

      setSelectedCard(card || null);

      setTransferCardForm({
        ...transferCardForm,
        cardAddress: card?.address!,
        tokenId: null,
      });
    } else {
      if (name === "receiver's address") {
        getProfile(value, network);
      }

      setTransferCardForm({
        ...transferCardForm,
        [name]: value,
      });
    }
  };

  const { transferCard, transferState, error } = useTransferLsp8Token(
    transferCardForm.cardAddress,
    transferCardForm.toAddress,
    transferCardForm.tokenId,
    profile,
    network,
  );

  const fields = [
    { name: 'cardName', label: 'Card Name', type: 'select' },
    { name: 'cardAddress', label: 'Card Address', type: 'select' },
    { name: 'tokenId', label: 'Token Id', type: 'select' },
  ];

  return (
    <StyledTransferCardModalContent>
      <ProfilePreview
        profile={destinationProfile}
        profileError={profileAddressError}
        isProfileLoading={isProfileLoading}
      />
      <InputField
        name="receiver's address"
        label="Receiver's address"
        type="text"
        changeHandler={changeHandler}
        align="start"
        placeholder="0x123456789…"
      />
      {fields.map((item, key) => (
        <StyledInputRow key={key}>
          <StyledLabel htmlFor={item.name}>{item.label}</StyledLabel>
          {item.type === 'select' && item.name === 'cardAddress' && (
            <StyledSelectInput
              name={item.name}
              onChange={changeHandler}
              value={selectedCard?.address || ''}
            >
              {ownedCards.map((card, key) => (
                <option
                  key={key}
                  value={card.address}
                  defaultValue={card.address}
                >
                  {card.address}
                </option>
              ))}
            </StyledSelectInput>
          )}
          {item.type === 'select' && item.name === 'cardName' && (
            <StyledSelectInput
              name={item.name}
              onChange={changeHandler}
              value={selectedCard?.name || ''}
            >
              {ownedCards.map((card, key) => (
                <option key={key} value={card.name} defaultValue={card.name}>
                  {card.name}
                </option>
              ))}
            </StyledSelectInput>
          )}
          {item.type === 'select' && item.name === 'tokenId' && (
            <StyledSelectInput
              name={item.name}
              onChange={changeHandler}
              value={transferCardForm.tokenId || 'Select token id'}
            >
              <option>Select token id</option>
              {profile.ownedAssets
                .find(
                  (ownedAsset) =>
                    ownedAsset.assetAddress === selectedCard?.address,
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
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton onClick={transferCard}>
          Transfer Card
        </StyledModalButton>
      </StyledModalButtonsWrapper>
    </StyledTransferCardModalContent>
  );
};
