import { ethers } from 'ethers';
import { useContext, useMemo, useState } from 'react';
import { ProfilePreview } from '../ProfilePreview';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import {
  StyledModalButtonsWrapper,
  StyledModalButton,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { IProfile } from '../../../services/models';
import { useProfile } from '../../../hooks/useProfile';
import { ModalContext } from '../../../context/ModalProvider';
import { STATUS } from '../../../utility';

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
  const { onDismissCallback } = useContext(ModalContext);
  const [toAddress, setToAddress] = useState<string>('');

  const [
    destinationProfile,
    profileAddressError,
    getProfile,
    isProfileLoading,
  ] = useProfile();

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

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    getProfile(event.target.value, network);
    setToAddress(event.target.value);
  };

  useMemo(() => {
    transferState === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
  }, [onDismissCallback, transferState]);

  return (
    <>
      <ProfilePreview
        profile={destinationProfile}
        profileError={profileAddressError}
        isProfileLoading={isProfileLoading}
      />
      <InputField
        name="receiver's address"
        label="Receiver's address"
        type="text"
        changeHandler={changeHandler}
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
