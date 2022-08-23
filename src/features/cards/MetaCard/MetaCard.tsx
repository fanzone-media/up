import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ICard, IProfile } from '../../../services/models';
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
import { useModal } from '../../../hooks/useModal';
import { TransferCardModal } from '../../../pages/ProfileDetails/TransferCardModal';
import Utils from '../../../services/utilities/util';

interface IProps {
  digitalCard: ICard;
  type: string;
  balance?: number;
  profile?: IProfile;
  canTransfer?: boolean;
}

interface IParams {
  network: NetworkName;
}

export const MetaCard: React.FC<IProps> = ({
  digitalCard,
  type,
  balance,
  profile,
  canTransfer,
}: IProps) => {
  const params = useParams<IParams>();
  const explorer = getChainExplorer(params.network);

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
      network={params.network}
    />,
    'Card Transfer Modal',
    'Transfer Card',
  );

  const getCardImg = () => {
    if (digitalCard.supportedInterface === 'erc721') {
      const img = digitalCard.lsp8MetaData[0]?.image;
      return img && img.startsWith('ipfs://')
        ? Utils.convertImageURL(img)
        : img;
    } else {
      const img = digitalCard?.lsp8MetaData[0]?.LSP4Metadata.images[0][0].url;
      return img && img.startsWith('ipfs://')
        ? Utils.convertImageURL(img)
        : img;
    }
  };

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
      <Link to={`/${params.network}/asset/` + digitalCard.address}>
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
