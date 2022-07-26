import { ethers } from 'ethers';
import { useState } from 'react';
import { NetworkName } from '../../../boot/types';
import { Modal } from '../../../components';
import { InputField } from '../../../components/InputField';
import {
  StyledModalButtonsWrapper,
  StyledModalButton,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { IProfile } from '../../../services/models';

interface TransferCardTokenIdModalProps {
  cardAddress: string;
  tokenId: number;
  profile: IProfile;
  onDismiss: () => any;
  network: NetworkName;
}

export const TransferCardTokenIdModal = ({
  cardAddress,
  tokenId,
  profile,
  onDismiss,
  network,
}: TransferCardTokenIdModalProps) => {
  const [toAddress, setToAddress] = useState<string>('');

  const { transferCard, transferState, resetState } = useTransferLsp8Token(
    cardAddress,
    toAddress,
    tokenId,
    profile,
    network,
  );

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'TRANSFERING CARD...',
    },
    successful: {
      mainHeading: 'TRANSFER SUCCESSFULL',
      description:
        'The card will appear in your Universal Profile in the next ... hours',
    },
    failed: {
      mainHeading: 'TRANSFER FAILED',
    },
  };

  return (
    <>
      <InputField
        name="receiver's address"
        label="Receiver's address"
        type="text"
        changeHandler={(e) => setToAddress(e.target.value)}
        align="start"
        placeholder="0x123456789…"
        value={toAddress}
      />
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          onClick={transferCard}
          disabled={!ethers.utils.isAddress(toAddress)}
        >
          Transfer Card
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        height="full"
        state={transferState}
        transactionMessages={transactionStatesMessages}
        callback={resetState}
      />
    </>
  );
};
