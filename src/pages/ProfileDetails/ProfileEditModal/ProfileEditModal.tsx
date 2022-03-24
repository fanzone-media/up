import { Signer } from 'ethers';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NetworkName } from '../../../boot/types';
import { Modal } from '../../../components/Modal';
import { LSP3ProfileApi } from '../../../services/controllers/LSP3Profile';
import { IProfile, ISetProfileData } from '../../../services/models';
import { StyledLoader, StyledLoadingHolder } from '../../AssetDetails/styles';
import {
  StyledEditProfileModalContent,
  StyledErrorLoadingContent,
  StyledErrorText,
  StyledInput,
  StyledInputRow,
  StyledLabel,
  StyledLoadingMessage,
  StyledSaveButton,
  StyledTextAreaInput,
} from './styles';

interface IParams {
  add: string;
  network: NetworkName;
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  signer: Signer;
  profile: IProfile;
}

type formInput = {
  profile_image: File | null;
  background_image: File | null;
  name: string;
  bio: string;
};

export const ProfileEditModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  signer,
  profile,
}: IProps) => {
  const params = useParams<IParams>();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [editProfileForm, setEditProfileForm] = useState<formInput>({
    profile_image: null,
    background_image: null,
    name: '',
    bio: '',
  });

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setEditProfileForm({
      ...editProfileForm,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const imageChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      setEditProfileForm({
        ...editProfileForm,
        [event.currentTarget.name]: event.currentTarget.files[0],
      });
    }
  };

  const fields = [
    { name: 'background_image', label: 'Background Image', type: 'file' },
    { name: 'profile_image', label: 'Profile Image', type: 'file' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'bio', label: 'Bio', type: 'textarea' },
  ];

  const data: ISetProfileData = useMemo(
    () => ({
      name:
        editProfileForm.name.length > 0 ? editProfileForm.name : profile.name,
      description:
        editProfileForm.bio.length > 0
          ? editProfileForm.bio
          : profile.description,
      backgroundImage: [
        {
          width: '',
          height: '',
          hashFunction: 'keccak256(bytes)',
          url:
            editProfileForm.background_image !== null
              ? editProfileForm.background_image
              : profile.backgroundImage,
        },
      ],
      profileImage: [
        {
          width: '',
          height: '',
          hashFunction: 'keccak256(bytes)',
          url:
            editProfileForm.profile_image !== null
              ? editProfileForm.profile_image
              : profile.profileImage,
        },
      ],
    }),
    [
      editProfileForm.background_image,
      editProfileForm.bio,
      editProfileForm.name,
      editProfileForm.profile_image,
      profile.backgroundImage,
      profile.description,
      profile.name,
      profile.profileImage,
    ],
  );

  const setData = async () => {
    setLoading(true);
    if (profile.isOwnerKeyManager) {
      await LSP3ProfileApi.setUniversalProfileDataViaKeyManager(
        profile.owner,
        profile.address,
        data,
        signer,
      )
        .catch((error) => {
          setError(true);
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      await LSP3ProfileApi.setUniversalProfileData(params.add, data, signer)
        .catch((error) => {
          setError(true);
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const extendedClose = () => {
    setError(false);
    onClose();
  };

  return isOpen ? (
    <Modal heading="Edit Profile" onClose={extendedClose}>
      {!loading && !error ? (
        <StyledEditProfileModalContent>
          {fields.map((item, i) => (
            <StyledInputRow key={i}>
              <StyledLabel>{item.label}</StyledLabel>
              {item.type === 'textarea' && (
                <StyledTextAreaInput
                  name={item.name}
                  onChange={changeHandler}
                />
              )}
              {(item.type === 'text' || item.type === 'file') && (
                <StyledInput
                  name={item.name}
                  type={item.type}
                  onChange={
                    item.type === 'file' ? imageChangeHandler : changeHandler
                  }
                  accept={item.type === 'file' ? '.jpg, .png' : ''}
                />
              )}
            </StyledInputRow>
          ))}
          <StyledSaveButton onClick={setData}>Save Changes</StyledSaveButton>
        </StyledEditProfileModalContent>
      ) : (
        <StyledErrorLoadingContent>
          {!error ? (
            <>
              <StyledLoadingHolder>
                <StyledLoader color="#ed7a2d" />
              </StyledLoadingHolder>
              <StyledLoadingMessage>
                confirm the metamask transaction and wait ....
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
