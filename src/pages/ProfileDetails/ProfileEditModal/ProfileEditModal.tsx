import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSigner } from 'wagmi';
import {
  FileInput,
  HiddenFileInput,
  HiddenFileInputWrapper,
} from '../../../components/InputField/styles';
import { addFile } from '../../../services/ipfsClient';
import { IProfile, ISetProfileData } from '../../../services/models';
import { sanitizeLink } from '../../../utility/content/text';
import { createImageFile } from '../../../utility/file';
import { StyledLoader, StyledLoadingHolder } from '../../AssetDetails/styles';
import { LSP3ProfileApi } from '../../../services/controllers/LSP3Profile';
import {
  FileEditWrapper,
  MetaLabel,
  MetaLabeledInput,
  PreviewImage,
  StyledEditProfileModalContent,
  StyledErrorLoadingContent,
  StyledErrorText,
  StyledInput,
  StyledInputRow,
  StyledLabel,
  StyledLoadingMessage,
  StyledSaveButton,
  StyledTextAreaInput,
  StyledErrorIcon,
} from './styles';
import { ExclamationIcon } from '../../../assets';
import { Signer } from 'ethers';

interface IProps {
  onDismiss: () => void;
  profile: IProfile;
  setTabName?: (name: string) => void;
}

type formInput = {
  profileImage: File | null;
  backgroundImage: File | null;
  name: string;
  bio: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

type SocialLink = 'facebook' | 'twitter' | 'instagram';

const socialLinks = {
  twitter: 'https://twitter.com/',
  facebook: 'https://facebook.com/',
  instagram: 'https://instagram.com/',
};

export const ProfileEditModal: React.FC<IProps> = ({
  onDismiss,
  profile,
  setTabName,
}: IProps) => {
  const linkFinder = useCallback(
    (title: SocialLink) => {
      const link = profile.links.find(
        (item) => item.title.toLowerCase() === title,
      );
      return link ? link.url : '';
    },
    [profile.links],
  );

  const { data: signer } = useSigner();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [txVerification, setTxVerification] = useState<boolean>(false);
  const [editProfileForm, setEditProfileForm] = useState<formInput>({
    profileImage: null,
    backgroundImage: null,
    name: profile.name,
    bio: profile.description,
    facebook: linkFinder('facebook'),
    twitter: linkFinder('twitter'),
    instagram: linkFinder('instagram'),
  });

  const [currentProfileImages, setCurrentProfileImages] = useState({
    profileImage: null,
    backgroundImage: null,
  });

  useEffect(() => {
    (async () => {
      setEditProfileForm({
        ...editProfileForm,
        profileImage: await createImageFile(profile.profileImage),
        backgroundImage: await createImageFile(profile.backgroundImage),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.profileImage, profile.backgroundImage]);

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
      const currentTarget = event.currentTarget;
      addFile(event.currentTarget.files[0])
        .then(async (path) => {
          if (!path) {
            return;
          }
          const imageUrl = `ipfs/${path.replace('ipfs://', '')}`;

          setCurrentProfileImages({
            ...currentProfileImages,
            [currentTarget.name]: imageUrl,
          });

          setEditProfileForm({
            ...editProfileForm,
            [currentTarget.name]: currentTarget.files![0],
          });
        })
        .catch((error) => {});
    }
  };

  const fields = [
    { name: 'backgroundImage', label: 'Background Image', type: 'file' },
    { name: 'profileImage', label: 'Profile Image', type: 'file' },
    { name: 'name', label: 'Name', type: 'text' },
    {
      name: 'twitter',
      label: 'Twitter',
      type: 'text',
      baseUrl: socialLinks.twitter,
    },
    {
      name: 'facebook',
      label: 'Facebook',
      type: 'text',
      baseUrl: socialLinks.facebook,
    },
    {
      name: 'instagram',
      label: 'Instagram',
      type: 'text',
      baseUrl: socialLinks.instagram,
    },
    { name: 'bio', label: 'Bio', type: 'textarea' },
  ];

  const data: ISetProfileData = useMemo(
    () => ({
      name: editProfileForm.name,
      description: editProfileForm.bio,
      backgroundImage: [
        {
          width: '',
          height: '',
          hash: profile.backgroundImageHash,
          hashFunction: 'keccak256(bytes)',
          url:
            editProfileForm.backgroundImage &&
            editProfileForm.backgroundImage.name !== profile.backgroundImage
              ? editProfileForm.backgroundImage
              : profile.backgroundImage,
        },
      ],
      profileImage: [
        {
          width: '',
          height: '',
          hashFunction: 'keccak256(bytes)',
          hash: profile.backgroundImageHash,
          url:
            editProfileForm.profileImage &&
            editProfileForm.profileImage.name !== profile.profileImage
              ? editProfileForm.profileImage
              : profile.profileImage,
        },
      ],
      links: [
        {
          title: 'facebook',
          url:
            editProfileForm.facebook.length > 0
              ? `https://facebook.com/${editProfileForm.facebook}`
              : linkFinder('facebook'),
        },
        {
          title: 'twitter',
          url:
            editProfileForm.twitter.length > 0
              ? `https://twitter.com/${editProfileForm.twitter}`
              : linkFinder('twitter'),
        },
        {
          title: 'instagram',
          url:
            editProfileForm.instagram.length > 0
              ? `https://instagram.com/${editProfileForm.instagram}`
              : linkFinder('instagram'),
        },
      ],
    }),
    [
      editProfileForm.backgroundImage,
      editProfileForm.bio,
      editProfileForm.facebook,
      editProfileForm.instagram,
      editProfileForm.name,
      editProfileForm.profileImage,
      editProfileForm.twitter,
      linkFinder,
      profile.backgroundImage,
      profile.backgroundImageHash,
      profile.profileImage,
    ],
  );

  const setData = async () => {
    setLoading(true);

    if (!signer) {
      return;
    }

    try {
      const transaction = await (profile.isOwnerKeyManager
        ? LSP3ProfileApi.setUniversalProfileDataViaKeyManager(
            profile.owner,
            profile.address,
            data,
            signer as Signer,
          )
        : LSP3ProfileApi.setUniversalProfileData(
            profile.address,
            data,
            signer as Signer,
          ));

      setTxVerification(true);

      await transaction.wait(1);

      window.location.reload();
    } catch (error) {
      if (setTabName) {
        setTabName('Oops...');
      }

      setError(true);
      return;
    }

    setLoading(false);
    setTxVerification(false);
    onDismiss();
  };

  const getImageUrl = useCallback((url: string) => {
    return url.includes('ipfs.infura-ipfs.io')
      ? url
      : `https://ipfs.fanzone.io/${sanitizeLink(url)}`;
  }, []);

  return !loading && !error ? (
    <StyledEditProfileModalContent>
      {fields.map((item, i) => (
        <StyledInputRow key={i}>
          <StyledLabel>{item.label}</StyledLabel>
          {item.type === 'textarea' && (
            <StyledTextAreaInput
              name={item.name}
              onChange={changeHandler}
              value={editProfileForm[item.name as keyof formInput] as string}
            />
          )}
          {item.type === 'text' && (
            <MetaLabeledInput>
              {item.baseUrl && <MetaLabel>{item.baseUrl}</MetaLabel>}
              <StyledInput
                name={item.name}
                type={item.type}
                onChange={changeHandler}
                value={sanitizeLink(
                  editProfileForm[item.name as keyof formInput] as string,
                )}
              />
            </MetaLabeledInput>
          )}
          {item.type === 'file' && (
            <FileEditWrapper>
              {(editProfileForm[item.name as keyof formInput] as File) && (
                <PreviewImage
                  alt={profile.name}
                  src={
                    (editProfileForm[item.name as keyof formInput] as File)
                      ? getImageUrl(
                          currentProfileImages[
                            item.name as keyof {
                              profileImage: any;
                              backgroundImage: any;
                            }
                          ] ||
                            ((
                              editProfileForm[
                                item.name as keyof formInput
                              ] as File
                            ).name as string),
                        )
                      : ''
                  }
                />
              )}
              <HiddenFileInputWrapper>
                <FileInput
                  title={
                    (editProfileForm[item.name as keyof formInput] as File)
                      ? getImageUrl(
                          (
                            editProfileForm[
                              item.name as keyof formInput
                            ] as File
                          ).name as string,
                        )
                      : ''
                  }
                  fileName={
                    (editProfileForm[item.name as keyof formInput] as File)
                      ? getImageUrl(
                          (
                            editProfileForm[
                              item.name as keyof formInput
                            ] as File
                          ).name as string,
                        )
                      : ''
                  }
                />
                <HiddenFileInput
                  title={
                    (editProfileForm[item.name as keyof formInput] as File)
                      ? getImageUrl(
                          (
                            editProfileForm[
                              item.name as keyof formInput
                            ] as File
                          ).name as string,
                        )
                      : ''
                  }
                  name={item.name}
                  onChange={imageChangeHandler}
                  accept=".jpg, .png"
                />
              </HiddenFileInputWrapper>
            </FileEditWrapper>
          )}
        </StyledInputRow>
      ))}
      <br />
      <StyledSaveButton onClick={setData}>Save Changes</StyledSaveButton>
    </StyledEditProfileModalContent>
  ) : (
    <StyledErrorLoadingContent>
      {!error ? (
        <>
          <StyledLoadingHolder>
            <StyledLoader color="#ed7a2d" width={40} />
          </StyledLoadingHolder>
          <StyledLoadingMessage>
            {txVerification
              ? 'Please wait, transaction is being verified ...'
              : ' Confirm the metamask transaction and wait ...'}
          </StyledLoadingMessage>
        </>
      ) : (
        <StyledErrorText>
          <StyledErrorIcon src={ExclamationIcon} />
          Something went wrong, please try again
        </StyledErrorText>
      )}
    </StyledErrorLoadingContent>
  );
};
