import React from 'react';
import { IProfile } from '../../../services/models';
import polygon from '../../../assets/polygon.svg';
import makeBlockie from 'ethereum-blockies-base64';
import Web3Service from '../../../services/Web3Service';
import {
  StyledBalance,
  StyledBalanceWrappar,
  StyledPolygon,
  StyledProfileBlockie,
  StyledProfileCard,
  StyledProfileDetail,
  StyledProfileDetailWrappar,
  StyledProfileImg,
  StyledProfileMedia,
  StyledProfileName,
  StyledProfileRole,
} from './styles';
import { useParams } from 'react-router-dom';

interface Iprops {
  userProfile: IProfile;
  type: string;
  balance?: number;
}

interface IParams {
  network: string;
}

export const ProfileCard: React.FC<Iprops> = React.memo(function ProfileList({
  userProfile,
  balance,
  type,
}: Iprops) {
  const params = useParams<IParams>();
  return (
    <StyledProfileCard
      to={
        `/${params.network}/profile/` + new Web3Service().checkSumAddress(userProfile.address)
      }
      className="animate-cardrender"
      demo={type === 'demo' ? true : false}
    >
      <StyledBalanceWrappar demo={type === 'demo' ? true : false}>
        <StyledBalance demo={type === 'demo' ? true : false}>
          {/* {type === 'demo' ? userProfile.balance : balance} */}
          {type === 'demo' ? 0 : balance}
        </StyledBalance>
      </StyledBalanceWrappar>
      <StyledPolygon
        src={polygon}
        alt=""
        demo={type === 'demo' ? true : false}
      />
      <StyledProfileMedia demo={type === 'demo' ? true : false}>
        <StyledProfileBlockie
          src={makeBlockie(userProfile.address)}
          alt=""
          demo={type === 'demo' ? true : false}
        />
        <StyledProfileImg
          src={userProfile.profileImage}
          alt=""
          demo={type === 'demo' ? true : false}
        />
      </StyledProfileMedia>
      <StyledProfileDetailWrappar demo={type === 'demo' ? true : false}>
        <StyledProfileDetail>
          <StyledProfileName demo={type === 'demo' ? true : false}>
            {' '}
            @{userProfile.name}{' '}
          </StyledProfileName>
          <StyledProfileRole>FANZONE user</StyledProfileRole>
        </StyledProfileDetail>
      </StyledProfileDetailWrappar>
    </StyledProfileCard>
  );
});
