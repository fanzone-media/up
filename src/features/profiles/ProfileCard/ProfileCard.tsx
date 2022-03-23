import React, { useMemo } from 'react';
import { IProfile } from '../../../services/models';
import polygon from '../../../assets/polygon.svg';
import makeBlockie from 'ethereum-blockies-base64';
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
import Web3 from 'web3';

interface Iprops {
  userProfile: IProfile;
  type: string;
  balance?: number;
  tooltipId?: string;
}

interface IParams {
  network: string;
  add: string;
}

export const ProfileCard: React.FC<Iprops> = ({
  userProfile,
  balance,
  type,
  tooltipId,
}: Iprops) => {
  const params = useParams<IParams>();
  const getTooltipTokenIds = useMemo(
    () =>
      type !== 'demo' &&
      userProfile.ownedAssets.find(
        (asset) =>
          asset.assetAddress.toLowerCase() === params.add.toLowerCase(),
      ),
    [params.add, type, userProfile.ownedAssets],
  );

  return (
    <StyledProfileCard
      to={
        `/${params.network}/profile/` +
        Web3.utils.toChecksumAddress(userProfile.address)
      }
      className="animate-cardrender"
      demo={type === 'demo' ? true : false}
      data-tip={
        type !== 'demo' && getTooltipTokenIds && getTooltipTokenIds.tokenIds
      }
      data-for={tooltipId}
    >
      <StyledBalanceWrappar demo={type === 'demo' ? true : false}>
        <StyledBalance demo={type === 'demo' ? true : false}>
          {type === 'demo' ? userProfile.ownedAssets.length : balance}
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
};