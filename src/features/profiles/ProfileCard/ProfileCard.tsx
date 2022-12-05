import React from 'react';
import { IProfile } from '../../../services/models';
import makeBlockie from 'ethereum-blockies-base64';
import {
  StyledProfileBlockie,
  StyledProfileCard,
  StyledProfileDetail,
  StyledProfileDetailWrapper,
  StyledProfileImg,
  StyledProfileMedia,
  StyledProfileName,
  StyledProfileRole,
} from './styles';
import Web3 from 'web3';
import { useUrlParams } from '../../../hooks/useUrlParams';

interface Iprops {
  userProfile: IProfile;
  type: string;
}

export const ProfileCard: React.FC<Iprops> = ({
  userProfile,
  type,
}: Iprops) => {
  const { network } = useUrlParams();

  return (
    <StyledProfileCard
      to={
        `/up/${network}/profile/` +
        Web3.utils.toChecksumAddress(userProfile.address)
      }
      $demo={type === 'demo' ? true : false}
    >
      <StyledProfileMedia $demo={type === 'demo' ? true : false}>
        <StyledProfileBlockie
          src={makeBlockie(userProfile.address)}
          alt=""
          $demo={type === 'demo' ? true : false}
        />
        <StyledProfileImg
          src={userProfile.profileImage}
          alt=""
          $demo={type === 'demo' ? true : false}
        />
      </StyledProfileMedia>
      <StyledProfileDetailWrapper $demo={type === 'demo' ? true : false}>
        <StyledProfileDetail>
          <StyledProfileName $demo={type === 'demo' ? true : false}>
            {' '}
            @{userProfile.name}{' '}
          </StyledProfileName>
          <StyledProfileRole>FANZONE user</StyledProfileRole>
        </StyledProfileDetail>
      </StyledProfileDetailWrapper>
    </StyledProfileCard>
  );
};
