import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ICard } from '../../../services/models';
import universalprofile from '../../../assets/universalprofile.png';
import blockscout from '../../../assets/blockscout.png';
import {
  StyledBlockScoutIcon,
  StyledCardDetail,
  StyledCardFullName,
  StyledCardName,
  StyledCardWrappar,
  StyledMediaWrappar,
  StyledMetaCardImg,
  StyledOwnedMint,
  StyledUniversalProfileIcon,
} from './styles';
import { getChainExplorer } from '../../../utility';

interface IProps {
  digitalCard: ICard;
  type: string;
  balance?: number;
}

interface IParams {
  network: string;
}

export const MetaCard: React.FC<IProps> = React.memo(function CardListItem({
  digitalCard,
  type,
  balance,
}: IProps) {
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
});
