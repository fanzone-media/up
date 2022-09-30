import React, { useEffect, useState } from 'react';
import { Puff } from 'react-loader-spinner';
import { ProfilePreview } from '../../AssetDetails/ProfilePreview';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { StyledInputRow, StyledLabel } from '../ProfileEditModal/styles';
import { StyledSelectInput, StyledTransferCardModalContent } from './styles';
import { Address } from '../../../utils/types';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { IOwnedAssets } from '../../../services/models';
import { InputField } from '../../../components/InputField';
import { NetworkName } from '../../../boot/types';
import { useCard } from '../../../hooks/useCard';
import { useProfile } from '../../../hooks/useProfile';

interface IProps {
  profile: {
    address: Address;
    owner: Address;
    isOwnerKeyManager: boolean;
    ownedAssets: IOwnedAssets[];
  };
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
}: IProps) => {
  const [transferCardForm, setTransferCardForm] = useState<formInput>({
    toAddress: '',
    cardAddress: profile.ownedAssets[0].assetAddress,
    tokenId: null,
  });

  const [card, getCardName, isCardLoading] = useCard();
  const [
    destinationProfile,
    profileAddressError,
    getProfile,
    isProfileLoading,
  ] = useProfile();

  useEffect(() => {
    getCardName(transferCardForm.cardAddress, network);
  }, [transferCardForm.cardAddress]);

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
      if (event.currentTarget.name === "receiver's address") {
        getProfile(event.currentTarget.value, network);
      }

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
    network,
  );

  const fields = [
    { name: 'cardName', label: 'Card Name', type: 'text' },
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
              defaultValue={profile.ownedAssets[0].assetAddress}
            >
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
          {item.type === 'text' &&
            item.name === 'cardName' &&
            (isCardLoading ? (
              <Puff color="#ed7a2db3" width={25} height={25} />
            ) : (
              <p>{card?.name}</p>
            ))}
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
