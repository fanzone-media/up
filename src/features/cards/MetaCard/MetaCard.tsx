import React from 'react';
import { Link } from 'react-router-dom';
import { ILSP4Card } from '../../../services/models';
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

interface IProps {
  digitalCard: ILSP4Card;
  type: string;
  balance?: number;
}

export const MetaCard: React.FC<IProps> = React.memo(function CardListItem({
  digitalCard,
  type,
  balance,
}: IProps) {
  return (
    <StyledCardWrappar>
      <a
        href={'https://universalprofile.cloud/asset/' + digitalCard.address}
        target="_blank"
        rel="noreferrer"
      >
        <StyledUniversalProfileIcon src={universalprofile} alt="" />
      </a>
      <a
        href={'https://blockscout.com/lukso/l14/address/' + digitalCard.address}
        target="_blank"
        rel="noreferrer"
      >
        <StyledBlockScoutIcon src={blockscout} alt="" />
      </a>
      <Link to={'/l14/asset/' + digitalCard.address}>
        <StyledMediaWrappar>
          <StyledMetaCardImg src={digitalCard.image} alt="" />
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
