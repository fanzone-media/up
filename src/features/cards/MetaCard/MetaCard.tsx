import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ICard, IProfile } from '../../../services/models';
import universalprofile from '../../../assets/universalprofile.png';
import transferIcon from '../../../assets/transfer-icon.png';
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
import { useModal } from '../../../hooks/useModal';
import { TransferCardModal } from '../../../pages/ProfileDetails/TransferCardModal';
import Utils from '../../../services/utilities/util';
import { useOwnedMints } from '../../../hooks/useOwnedMints';
import { useUrlParams } from '../../../hooks/useUrlParams';

interface IProps {
  digitalCard: ICard;
  type: string;
  balance?: number;
  profile?: IProfile;
  canTransfer?: boolean;
}

export const MetaCard: React.FC<IProps> = ({
  digitalCard,
  type,
  profile,
  canTransfer,
}: IProps) => {
  const { network } = useUrlParams();
  const explorer = getChainExplorer(network);
  const { currentTokenId } = useOwnedMints(
    profile ? profile.address : '',
    digitalCard.address,
  );

  const {
    handlePresent: onPresentTransferCardModal,
    onDismiss: onDismissTransferCardModal,
  } = useModal(
    <TransferCardModal
      profile={{
        address: profile?.address ? profile.address : '',
        owner: profile?.owner ? profile.owner : '',
        isOwnerKeyManager: profile?.isOwnerKeyManager
          ? profile.isOwnerKeyManager
          : false,
        ownedAssets: profile?.ownedAssets ? profile.ownedAssets : [],
      }}
      asset={digitalCard}
      onDismiss={() => onDismissTransferCardModal()}
      network={network}
    />,
    'Card Transfer Modal',
    'Transfer Card',
  );

  const getCardImg = () => {
    if (digitalCard.supportedInterface === 'erc721') {
      const img = digitalCard.lsp8MetaData[0]?.image;
      return img && Utils.convertURL(img);
    } else {
      const img = digitalCard?.lsp8MetaData[0]?.LSP4Metadata.images[0][0].url;
      return img && Utils.convertURL(img);
    }
  };

  return (
    <StyledCardWrapper>
      {network === 'l14' && (
        <a
          href={'https://universalprofile.cloud/asset/' + digitalCard.address}
          target="_blank"
          rel="noreferrer"
        >
          <StyledUniversalProfileIcon src={universalprofile} alt="" />
        </a>
      )}
      {canTransfer === true && (
        <StyledTransferButton onClick={onPresentTransferCardModal}>
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
      <Link
        to={
          type === 'owned'
            ? `/up/${network}/asset/${digitalCard.address}/${currentTokenId}`
            : `/up/${network}/asset/` + digitalCard.address
        }
      >
        <StyledMediaWrapper>
          <StyledMetaCardImg src={getCardImg()} alt="" />
        </StyledMediaWrapper>
        <StyledCardDetail>
          <StyledCardName>{digitalCard.name.split('•')[0]}</StyledCardName>
          <StyledCardFullName>{digitalCard.name}</StyledCardFullName>
        </StyledCardDetail>
      </Link>
    </StyledCardWrapper>
  );
};
