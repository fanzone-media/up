import { ethers } from 'ethers';
import { useState } from 'react';
import { Modal } from '../../../components';
import { InputField } from '../../../components/InputField';
import {
  StyledModalButtonsWrapper,
  StyledModalButton,
} from '../../../components/Modal/styles';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { IProfile } from '../../../services/models';

interface TransferCardTokenIdModalProps {
  cardAddress: string;
  tokenId: number;
  profile: IProfile;
  onDismiss: () => any;
}

export const TransferCardTokenIdModal = ({
  cardAddress,
  tokenId,
  profile,
  onDismiss,
}: TransferCardTokenIdModalProps) => {
  const [toAddress, setToAddress] = useState<string>('');

  const { transferCard, transfering } = useTransferLsp8Token(
    cardAddress,
    toAddress,
    tokenId,
    profile,
    onDismiss,
  );

  return (
    <Modal>
      <InputField
        name="receiver's address"
        label="Receiver's address"
        type="text"
        changeHandler={(e) => setToAddress(e.target.value)}
        align="start"
        placeholder="0x123456789…"
        value={toAddress}
      />
      <StyledModalButtonsWrapper topMargin>
        <StyledModalButton
          onClick={transferCard}
          disabled={!ethers.utils.isAddress(toAddress)}
        >
          {transfering ? 'Transfering Card…' : 'Transfer Card'}
        </StyledModalButton>
      </StyledModalButtonsWrapper>
    </Modal>
  );
};
