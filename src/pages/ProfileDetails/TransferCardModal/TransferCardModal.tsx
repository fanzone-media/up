import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { ICard, IOwnedAssets, IProfile } from '../../../services/models';
import {
  StyledInput,
  StyledInputRow,
  StyledLabel,
  PreviewImage,
  ProfileInfo,
  ProfileName,
  ProfileError,
  ImageWrapper,
} from '../ProfileEditModal/styles';
import { StyledSelectInput, StyledTransferCardModalContent } from './styles';
import { Address } from '../../../utils/types';
import { trimedAddress } from '../../../utility/content/addresses';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { NetworkName } from '../../../boot/types';
import { LSP3ProfileApi } from '../../../services/controllers/LSP3Profile';

interface IProps {
  profile: {
    address: Address;
    owner: Address;
    isOwnerKeyManager: boolean;
    ownedAssets: IOwnedAssets[];
  };
  asset: ICard;
  onDismiss: () => any;
  network: NetworkName;
}

type formInput = {
  toAddress: string;
  cardAddress: string;
  tokenId: number | null;
};

export const TransferCardModal = ({
  profile,
  asset,
  onDismiss,
  network,
}: IProps) => {
  const [transferCardForm, setTransferCardForm] = useState<formInput>({
    toAddress: '',
    cardAddress: asset.address,
    tokenId: null,
  });

  const { transferCard, transferState, error } = useTransferLsp8Token(
    transferCardForm.cardAddress,
    transferCardForm.toAddress,
    transferCardForm.tokenId,
    profile,
    network,
  );

  const [destinationProfile, setDestinationProfile] = useState<IProfile | null>(
    null,
  );
  const [profileAddressError, setProfileAddressError] = useState<string | null>(
    null,
  );

  const getProfile = async (
    address: string,
    network: NetworkName,
  ): Promise<IProfile | void> => {
    if (address.length !== 42) {
      const missingCaractersCount = 42 - address.length;

      throw new Error(
        `Invalid address, missing ${missingCaractersCount} character${
          missingCaractersCount === 1 ? '' : 's'
        }`,
      );
    }

    if (!ethers.utils.isAddress(address)) {
      throw new Error('Address is invalid or does not exists');
    }

    const isValidProfile = await LSP3ProfileApi.isUniversalProfile(
      address,
      network,
    );

    if (!isValidProfile) {
      throw new Error('Address is invalid or does not exists');
    }

    return LSP3ProfileApi.fetchProfile(address, network);
  };

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
      if (event.currentTarget.name === 'toAddress') {
        getProfile(event.currentTarget.value, network)
          .then((profile) => {
            if (profile) {
              setDestinationProfile(profile);
              setProfileAddressError(null);
            }
          })
          .catch((error) => {
            setDestinationProfile(null);
            setProfileAddressError(error.message);
          });
      }

      setTransferCardForm({
        ...transferCardForm,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const fields = [
    { name: 'toAddress', label: 'To', type: 'text' },
    { name: 'cardName', label: 'Card Name', type: 'select' },
    { name: 'cardAddress', label: 'Card Address', type: 'select' },
    { name: 'tokenId', label: 'Token Id', type: 'select' },
  ];

  return (
    <StyledTransferCardModalContent>
      <ProfileInfo>
        {profileAddressError && (
          <ProfileError>{profileAddressError}</ProfileError>
        )}
        {destinationProfile && (
          <ImageWrapper>
            <PreviewImage src={destinationProfile.profileImage} />
            <ProfileName>{destinationProfile.name}</ProfileName>
          </ImageWrapper>
        )}
      </ProfileInfo>
      {fields.map((item, i) => (
        <StyledInputRow key={i}>
          <StyledLabel htmlFor={item.name}>{item.label}</StyledLabel>
          {item.type === 'text' && (
            <StyledInput
              id={item.name}
              name={item.name}
              type={item.type}
              onChange={changeHandler}
            />
          )}
          {item.type === 'select' && item.name === 'cardName' && (
            <p>{asset.name}</p>
          )}
          {item.type === 'select' && item.name === 'cardAddress' && (
            <p>{trimedAddress(asset.address)}</p>
          )}
          {item.type === 'select' && item.name === 'tokenId' && (
            <StyledSelectInput name={item.name} onChange={changeHandler}>
              <option>Select token id</option>
              {profile.ownedAssets
                .find((ownedAsset) => ownedAsset.assetAddress === asset.address)
                ?.tokenIds.map((tokenId, key) => (
                  <option key={key} value={tokenId} defaultValue={tokenId}>
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
