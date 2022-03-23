import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ICard } from '../../../services/models';
import universalprofile from '../../../assets/universalprofile.png';
import transferIcon from '../../../assets/transfer-icon.png';
import {
  StyledBlockScoutIcon,
  StyledCardDetail,
  StyledCardFullName,
  StyledCardName,
  StyledCardWrappar,
  StyledMediaWrappar,
  StyledMetaCardImg,
  StyledOwnedMint,
  StyledTransferButton,
  StyledTransferIcon,
  StyledUniversalProfileIcon,
} from './styles';
import { getChainExplorer } from '../../../utility';
import { NetworkName } from '../../../boot/types';

interface IProps {
  digitalCard: ICard;
  type: string;
  balance?: number;
  openTransferCardModal?: (address: string) => void;
}

interface IParams {
  network: NetworkName;
}

export const MetaCard: React.FC<IProps> = ({
  digitalCard,
  type,
  balance,
  openTransferCardModal,
}: IProps) => {
  const params = useParams<IParams>();
  const explorer = getChainExplorer(params.network);
  return (
    <StyledCardWrappar>
      {params.network === 'l14' && (
        <a
          href={'https://universalprofile.cloud/asset/' + digitalCard.address}
          target="_blank"
          rel="noreferrer"
        >
          <StyledUniversalProfileIcon src={universalprofile} alt="" />
        </a>
      )}
      {openTransferCardModal && (
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
        <StyledMediaWrappar>
          <StyledMetaCardImg src={digitalCard.ls8MetaData.image} alt="" />
        </StyledMediaWrappar>
        <StyledCardDetail>
          <StyledCardName>{digitalCard.name.split('•')[0]}</StyledCardName>
          <StyledCardFullName>
            {digitalCard.name.replaceAll('•', '/')}
          </StyledCardFullName>
          {type === 'owned' && (
            <StyledOwnedMint>
              ( {balance} / {digitalCard.totalSupply} )
            </StyledOwnedMint>
          )}
        </StyledCardDetail>
      </Link>
    </StyledCardWrappar>
  );
};
