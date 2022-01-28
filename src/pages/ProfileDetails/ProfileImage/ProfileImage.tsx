import React from 'react';
import { BlockScoutIcon, UniversalProfileIcon } from '../../../assets';
import {
  StyledBlockieImg,
  StyledBlockScoutLogo,
  StyledProfileImageWrappar,
  StyledProfileImg,
  StyledUniversalProfileLogo,
} from './styles';

interface IProps {
  profileImgSrc?: string;
  blockieImgSrc?: string;
  profileAddress?: string;
}

export const ProfileImage: React.FC<IProps> = ({
  profileImgSrc,
  blockieImgSrc,
  profileAddress,
}: IProps) => {
  return (
    <StyledProfileImageWrappar>
      <StyledBlockieImg src={blockieImgSrc} />
      <a
        href={'https://blockscout.com/lukso/l14/address/' + profileAddress}
        target="_blank"
        rel="noreferrer"
      >
        <StyledBlockScoutLogo src={BlockScoutIcon} />
      </a>
      <a
        href={'https://universalprofile.cloud/' + profileAddress}
        target="_blank"
        className=""
        rel="noreferrer"
      >
        <StyledUniversalProfileLogo src={UniversalProfileIcon} />
      </a>
      <StyledProfileImg src={profileImgSrc} />
    </StyledProfileImageWrappar>
  );
};
