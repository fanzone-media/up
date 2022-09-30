import React from 'react';
import { Puff } from 'react-loader-spinner';
import { IProfile } from '../../../services/models';
import {
  PreviewImage,
  ProfileError,
  ProfileInfo,
  ProfileName,
  ImageWrapper,
} from './styles';

interface IProps {
  profile: IProfile | null;
  profileError: string;
  isProfileLoading: boolean;
}

export const ProfilePreview: React.FC<IProps> = ({
  profile,
  profileError,
  isProfileLoading,
}) => {
  return (
    <ProfileInfo>
      {isProfileLoading && <Puff color="#ed7a2db3" width={30} height={30} />}
      {!isProfileLoading && profileError && (
        <ProfileError>{profileError}</ProfileError>
      )}
      {!isProfileLoading && profile && (
        <ImageWrapper>
          <PreviewImage src={profile.profileImage} />
          <ProfileName>{profile.name}</ProfileName>
        </ImageWrapper>
      )}
    </ProfileInfo>
  );
};
