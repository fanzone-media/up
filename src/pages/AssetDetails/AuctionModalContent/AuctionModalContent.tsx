import { useCallback, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { useAuctionOptions } from '../../../hooks/useAuctionOptions';
import { useSetAuction } from '../../../hooks/useSetAuction';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { Address } from '../../../utils/types';
import {
  StyledInputGroup,
  StyledTokenSelectorDropDown,
} from '../SellCardModal/styles';
import {
  StyledAuctionDurationInfo,
  StyledAuctionModal,
  StyledAuctionModalInputContainer,
  StyledStepsText,
} from './styles';
import { isAddress } from 'ethers/lib/utils';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { useAuthorizeOperator } from '../../../hooks/useAuthorizeOperator';
import { auctionContracts } from '../../../services/controllers/Auction';

interface IProps {
  network: NetworkName;
  profile: IProfile;
  assetAddress: Address;
  tokenId: number;
  whiteListedTokens: Array<IWhiteListedTokens>;
  onDismiss: () => any;
}

export const AuctionModalContent = ({
  network,
  profile,
  assetAddress,
  tokenId,
  whiteListedTokens,
  onDismiss,
}: IProps) => {
  const auctionOptions = useAuctionOptions(network);
  const { isAuthorized, authorizeOperator } = useAuthorizeOperator(
    assetAddress,
    auctionContracts[network],
    profile.address,
    tokenId,
    network,
  );
  const { setForAuction, auctioningState } = useSetAuction();
  const [auctionForm, setAuctionForm] = useState<{
    acceptedToken: Address;
    minBidAmount: number;
    duration: number;
  }>({
    acceptedToken: whiteListedTokens[0]?.tokenAddress.toLowerCase(),
    minBidAmount: 0,
    duration: 0,
  });

  const acceptedTokenDetails = useMemo(
    () =>
      whiteListedTokens.find(
        (item) =>
          item.tokenAddress.toLowerCase() ===
          auctionForm.acceptedToken.toLowerCase(),
      ),
    [auctionForm.acceptedToken, whiteListedTokens],
  );

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'SETTING FOR SALE...',
    },
    successful: {
      mainHeading: 'SUCCESSFULLY SET FOR AUCTION',
    },
    failed: {
      mainHeading: 'SOMETHING WENT WRONG',
    },
  };

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (event.currentTarget.name === 'endTime') {
      const duration =
        DateTime.fromISO(event.currentTarget.value).toUnixInteger() -
        DateTime.now().toUnixInteger();
      setAuctionForm({
        ...auctionForm,
        duration,
      });
    } else {
      setAuctionForm({
        ...auctionForm,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const timeDuration = useMemo(() => {
    const min = auctionOptions && {
      date: DateTime.now()
        .plus({ seconds: auctionOptions.minAuctionDuration })
        .toISO()
        .split('T')[0],
      time: DateTime.now()
        .plus({ seconds: auctionOptions.minAuctionDuration })
        .toISOTime()
        .split('.')[0],
    };
    const max = auctionOptions && {
      date: DateTime.now()
        .plus({ seconds: auctionOptions.maxAuctionDuration })
        .toISO()
        .split('T')[0],
      time: DateTime.now()
        .plus({ seconds: auctionOptions.maxAuctionDuration })
        .toISOTime()
        .split('.')[0],
    };
    return { min, max };
  }, [auctionOptions]);

  const validateInput = useCallback(() => {
    if (
      auctionOptions &&
      isAuthorized &&
      whiteListedTokens &&
      whiteListedTokens.length > 0 &&
      acceptedTokenDetails &&
      isAddress(auctionForm.acceptedToken) &&
      auctionForm.duration <= auctionOptions?.maxAuctionDuration &&
      auctionForm.duration >= auctionOptions?.minAuctionDuration &&
      auctionForm.minBidAmount > 0
    ) {
      return true;
    } else {
      return false;
    }
  }, [
    acceptedTokenDetails,
    auctionForm.acceptedToken,
    auctionForm.duration,
    auctionForm.minBidAmount,
    auctionOptions,
    isAuthorized,
    whiteListedTokens,
  ]);

  const onSubmit = () => {
    if (validateInput()) {
      setForAuction(
        profile,
        assetAddress,
        tokenId,
        auctionForm.duration,
        auctionForm.minBidAmount,
        auctionForm.acceptedToken,
        acceptedTokenDetails ? acceptedTokenDetails.decimals : 0,
        network,
      );
    }
  };

  return (
    <StyledAuctionModal>
      <StyledStepsText>
        1. Approve the auction contract as an operator
      </StyledStepsText>
      <StyledModalButton disabled={isAuthorized} onClick={authorizeOperator}>
        Approve
      </StyledModalButton>
      <StyledStepsText>2. Provide Auction details</StyledStepsText>
      <StyledAuctionModalInputContainer>
        <StyledInputGroup>
          <InputField
            name="minBidAmount"
            label="Min Bid Amount"
            type="number"
            changeHandler={changeHandler}
          />
          <StyledTokenSelectorDropDown
            name="acceptedToken"
            onChange={changeHandler}
          >
            {whiteListedTokens.map((item, i) => (
              <option
                key={i}
                value={item.tokenAddress}
                selected={
                  item.tokenAddress.toLowerCase() ===
                  whiteListedTokens[0].tokenAddress.toLowerCase()
                }
              >
                {item.symbol}
              </option>
            ))}
          </StyledTokenSelectorDropDown>
        </StyledInputGroup>
        <InputField
          name="endTime"
          label="End Time"
          type="datetime-local"
          min={`${timeDuration.min?.date}T${timeDuration.min?.time}`}
          max={`${timeDuration.max?.date}T${timeDuration.max?.time}`}
          changeHandler={changeHandler}
        />
        <StyledAuctionDurationInfo>
          auction end time must be between {timeDuration.min?.date}{' '}
          {timeDuration.min?.time} and {timeDuration.max?.date}{' '}
          {timeDuration.max?.time}
        </StyledAuctionDurationInfo>
      </StyledAuctionModalInputContainer>

      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton onClick={onSubmit} disabled={!validateInput()}>
          Set for auction
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={auctioningState}
        transactionMessages={transactionStatesMessages}
      />
    </StyledAuctionModal>
  );
};
