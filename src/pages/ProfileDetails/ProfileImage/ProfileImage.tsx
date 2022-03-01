import React from 'react';
import { useParams } from 'react-router-dom';
import { BlockScoutIcon, UniversalProfileIcon } from '../../../assets';
import { getChainExplorer } from '../../../utility';
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

interface IParams {
  network: string;
}

export const ProfileImage: React.FC<IProps> = ({
  profileImgSrc,
  blockieImgSrc,
  profileAddress,
}: IProps) => {
  const params = useParams<IParams>();
  const explorer = getChainExplorer(params.network);
  return (
    <StyledProfileImageWrappar>
      <StyledBlockieImg src={blockieImgSrc} />
      <a
        href={explorer && explorer.exploreUrl + profileAddress}
        target="_blank"
        rel="noreferrer"
      >
        <StyledBlockScoutLogo src={explorer && explorer.icon} />
      </a>
      {params.network === 'l14' && (
        <a
          href={'https://universalprofile.cloud/' + profileAddress}
          target="_blank"
          className=""
          rel="noreferrer"
        >
          <StyledUniversalProfileLogo src={UniversalProfileIcon} />
        </a>
      )}
      <StyledProfileImg src={profileImgSrc} />
    </StyledProfileImageWrappar>
  );
};
