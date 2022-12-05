import React from 'react';
import { useParams } from 'react-router-dom';
import { UniversalProfileIcon } from '../../../assets';
import { NetworkName } from '../../../boot/types';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { getChainExplorer } from '../../../utility';
import {
  StyledBlockieImg,
  StyledBlockScoutLogo,
  StyledProfileImageWrapper,
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
  const { network } = useUrlParams();
  const explorer = getChainExplorer(network);
  return (
    <StyledProfileImageWrapper>
      <StyledBlockieImg src={blockieImgSrc} />
      <a
        href={explorer && explorer.exploreUrl + profileAddress}
        target="_blank"
        rel="noreferrer"
      >
        <StyledBlockScoutLogo src={explorer && explorer.icon} />
      </a>
      {network in ['l14', 'l16'] && (
        <a
          href={'https://universalprofile.cloud/' + profileAddress}
          target="_blank"
          rel="noreferrer"
        >
          <StyledUniversalProfileLogo src={UniversalProfileIcon} />
        </a>
      )}
      <StyledProfileImg src={profileImgSrc} />
    </StyledProfileImageWrapper>
  );
};
