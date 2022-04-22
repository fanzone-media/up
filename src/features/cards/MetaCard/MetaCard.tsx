import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ICard } from '../../../services/models';
import universalprofile from '../../../assets/universalprofile.png';
import transferIcon from '../../../assets/transfer-icon.png';
import polygon from '../../../assets/polygon.svg';
import {
  StyledBlockScoutIcon,
  StyledCardDetail,
  StyledCardFullName,
  StyledCardName,
  StyledCardWrapper,
  StyledMediaWrapper,
  StyledMetaCardImg,
  StyledTransferButton,
  StyledTransferIcon,
  StyledUniversalProfileIcon,
} from './styles';
import { getChainExplorer } from '../../../utility';
import { NetworkName } from '../../../boot/types';
import {
  StyledBalance,
  StyledBalanceWrapper,
  StyledPolygon,
} from '../../profiles/ProfileCard/styles';

interface IProps {
  digitalCard: ICard;
  type: string;
  balance?: number;
  openTransferCardModal?: (address: string) => void;
  transferPermission?: boolean;
}

interface IParams {
  network: NetworkName;
}

export const MetaCard: React.FC<IProps> = ({
  digitalCard,
  type,
  balance,
  openTransferCardModal,
  transferPermission,
}: IProps) => {
  const params = useParams<IParams>();
  const explorer = getChainExplorer(params.network);
  return (
    <StyledCardWrapper>
      {params.network === 'l14' && (
        <a
          href={'https://universalprofile.cloud/asset/' + digitalCard.address}
          target="_blank"
          rel="noreferrer"
        >
          <StyledUniversalProfileIcon src={universalprofile} alt="" />
        </a>
      )}
      {type === 'owned' && (
        <>
          <StyledBalanceWrapper demo={true}>
            <StyledBalance demo={true}>{balance}</StyledBalance>
          </StyledBalanceWrapper>
          <StyledPolygon src={polygon} alt="" demo={true} />
        </>
      )}
      {transferPermission === true && openTransferCardModal && (
        <StyledTransferButton
          onClick={() => openTransferCardModal(digitalCard.address)}
        >
          <StyledTransferIcon src={transferIcon} alt="" />
        </StyledTransferButton>
      )}
      <a
        href={explorer && explorer.exploreUrl + digitalCard.address}
        target="_blank"
        rel="noreferrer"
      >
        <StyledBlockScoutIcon src={explorer?.icon} alt="" />
      </a>
      <Link to={`/${params.network}/asset/` + digitalCard.address}>
        <StyledMediaWrapper>
          <StyledMetaCardImg src={digitalCard.ls8MetaData[0].image} alt="" />
        </StyledMediaWrapper>
        <StyledCardDetail>
          <StyledCardName>{digitalCard.name.split('•')[0]}</StyledCardName>
          <StyledCardFullName>{digitalCard.name}</StyledCardFullName>
        </StyledCardDetail>
      </Link>
    </StyledCardWrapper>
  );
};
