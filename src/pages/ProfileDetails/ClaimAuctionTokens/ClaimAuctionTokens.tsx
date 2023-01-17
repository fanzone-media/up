import { useMemo, useState } from 'react';
import { NetworkName } from '../../../boot/types';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { useClaimAuctionTokens } from '../../../hooks';
import { IProfile } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { Address } from '../../../utils/types';
import {
  StyledBalanceLabel,
  StyledBalanceValue,
  StyledBalanceWrapper,
  StyledRadioInput,
  StyledRadioLabel,
  StyledTokenLabel,
} from '../WithdrawFundsModal/styles';
import { StyledClaimAuctionTokensModalContent } from './styles';

interface IProps {
  profile: IProfile;
  network: NetworkName;
  onDismiss: () => any;
}

export const ClaimAuctionTokens = ({ profile, network, onDismiss }: IProps) => {
  const { claimableTokens, claimTokens, state, resetState } =
    useClaimAuctionTokens(profile.address, profile, network);
  const [selectedTokenInput, setSelectedTokenInput] = useState<Address | null>(
    null,
  );

  const selectedTokenInfo = useMemo(
    () =>
      claimableTokens &&
      claimableTokens.find(
        (item) => item.tokenAddress.toLowerCase() === selectedTokenInput,
      ),
    [claimableTokens, selectedTokenInput],
  );

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSelectedTokenInput(event.currentTarget.value);
  };

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'CLAIMING TOKENS. . .',
    },
    successful: {
      mainHeading: 'TOKEN CLAIM SUCCESSFULL',
    },
    failed: {
      mainHeading: 'TOKENS CLAIM FAILED',
      description: 'Please try agian.',
    },
  };

  return (
    <StyledClaimAuctionTokensModalContent>
      {claimableTokens?.map((item, i) => (
        <StyledRadioLabel
          key={i}
          htmlFor="token"
          $checked={
            selectedTokenInput
              ? selectedTokenInput.toLowerCase() ===
                item.tokenAddress.toLowerCase()
              : false
          }
        >
          <StyledRadioInput
            name="payment"
            type="radio"
            id="token"
            value={item.tokenAddress}
            onChange={changeHandler}
          />
          <StyledTokenLabel>{item.symbol}</StyledTokenLabel>
          <StyledBalanceWrapper>
            <StyledBalanceLabel>Balance: </StyledBalanceLabel>
            <StyledBalanceValue>
              {displayPrice(item.amount, item.decimals)}
            </StyledBalanceValue>
          </StyledBalanceWrapper>
        </StyledRadioLabel>
      ))}
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          disabled={!selectedTokenInfo || selectedTokenInfo.amount <= 0}
          onClick={() => selectedTokenInput && claimTokens(selectedTokenInput)}
        >
          Claim token
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        height="full"
        state={state}
        transactionMessages={transactionStatesMessages}
        callback={resetState}
      />
    </StyledClaimAuctionTokensModalContent>
  );
};
