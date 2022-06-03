import { title } from 'process';
import React, { useCallback, useMemo, useState } from 'react';
import { useSigner } from 'wagmi';
import { Modal } from '../../../components';
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

interface IProps {
  onDismiss: () => void;
  profile: IProfile;
}

type formInput = {
  profile_image: File | null;
  background_image: File | null;
  name: string;
  bio: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

export const ProfileEditModal: React.FC<IProps> = ({
  onDismiss,
  profile,
}: IProps) => {
  const [{ data: signer }] = useSigner();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [editProfileForm, setEditProfileForm] = useState<formInput>({
    profile_image: null,
    background_image: null,
    name: profile.name,
    bio: profile.description,
    facebook: '',
    twitter: '',
    instagram: '',
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

  const linkFinder = useCallback(
    (title: 'facebook' | 'twitter' | 'instagram') => {
      const link = profile.links.find(
        (item) => item.title.toLowerCase() === title,
      );
      return link ? link.url : '';
    },
    [profile.links],
  );

  const fields = [
    { name: 'background_image', label: 'Background Image', type: 'file' },
    { name: 'profile_image', label: 'Profile Image', type: 'file' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'bio', label: 'Bio', type: 'textarea' },
    { name: 'twitter', label: 'Twitter', type: 'text' },
    { name: 'facebook', label: 'Facebook', type: 'text' },
    { name: 'instagram', label: 'Instagram', type: 'text' },
  ];

  const data: ISetProfileData = useMemo(
    () => ({
      name: editProfileForm.name,
      description: editProfileForm.bio,
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
      links: [
        {
          title: 'facebook',
          url:
            editProfileForm.facebook.length > 0
              ? `https://www.facebook.com/${editProfileForm.facebook}`
              : linkFinder('facebook'),
        },
        {
          title: 'twitter',
          url:
            editProfileForm.twitter.length > 0
              ? `https://www.twitter.com/${editProfileForm.twitter}`
              : linkFinder('twitter'),
        },
        {
          title: 'instagram',
          url:
            editProfileForm.facebook.length > 0
              ? `https://www.instagram.com/${editProfileForm.instagram}`
              : linkFinder('instagram'),
        },
      ],
    }),
    [
      editProfileForm.background_image,
      editProfileForm.bio,
      editProfileForm.facebook,
      editProfileForm.instagram,
      editProfileForm.name,
      editProfileForm.profile_image,
      editProfileForm.twitter,
      linkFinder,
      profile.backgroundImage,
      profile.profileImage,
    ],
  );

  const setData = async () => {
    setLoading(true);
    if (profile.isOwnerKeyManager) {
      signer &&
        (await LSP3ProfileApi.setUniversalProfileDataViaKeyManager(
          profile.owner,
          profile.address,
          data,
          signer,
        )
          .catch((error) => {
            setError(true);
            // onDismiss();
          })
          .finally(() => {
            setLoading(false);
          }));
    } else {
      signer &&
        (await LSP3ProfileApi.setUniversalProfileData(
          profile.address,
          data,
          signer,
        )
          .catch((error) => {
            setError(true);
            // onDismiss();
          })
          .finally(() => {
            setLoading(false);
          }));
    }
  };

  return (
    <Modal>
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
  );
};
