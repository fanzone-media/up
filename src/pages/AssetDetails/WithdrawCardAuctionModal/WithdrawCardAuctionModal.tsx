import { useContext, useEffect } from 'react';
import { NetworkName } from '../../../boot/types';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { ModalContext } from '../../../context/ModalProvider';
import { useRemoveAuction } from '../../../hooks';
import { IProfile } from '../../../services/models';
import { STATUS } from '../../../utility';
import { Address } from '../../../utils/types';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledWithdrawCardAuctionModalContent,
  StyledWithdrawFromAuctionText,
} from './styles';

interface IProps {
  assetAddress: Address;
  tokenId: number;
  profile: IProfile;
  network: NetworkName;
  onDismiss: () => void;
}

export const WithdrawCardAuctionModal = ({
  profile,
  assetAddress,
  tokenId,
  network,
  onDismiss,
}: IProps) => {
  const { onDismissCallback } = useContext(ModalContext);
  const { removeAuctionState, removeAuction } = useRemoveAuction(
    profile,
    assetAddress,
    Number(tokenId),
    network,
  );

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'WITHDRAWING FROM AUCTION...',
    },
    successful: {
      mainHeading: 'SUCCESSFULLY WITHDRAWN FROM AUCTION',
    },
    failed: {
      mainHeading: 'SOMETHING WENT WRONG',
    },
  };

  useEffect(() => {
    removeAuctionState === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeAuctionState]);

  return (
    <StyledWithdrawCardAuctionModalContent>
      <CardPriceInfoForModal
        address={assetAddress}
        mint={Number(tokenId)}
        cardImg=""
      />
      <StyledWithdrawFromAuctionText>
        Are you sure you want to withdraw the card from sale?
      </StyledWithdrawFromAuctionText>
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton onClick={() => removeAuction()}>
          Withdraw
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={removeAuctionState}
        transactionMessages={transactionStatesMessages}
      />
    </StyledWithdrawCardAuctionModalContent>
  );
};
