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
} from './styles';
import { isAddress } from 'ethers/lib/utils';

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
  const { setForAuction } = useSetAuction();
  const [auctionForm, setAuctionForm] = useState<{
    acceptedToken: Address;
    minBidAmount: number;
    duration: number;
  }>({
    acceptedToken: whiteListedTokens[0]?.tokenAddress.toLowerCase(),
    minBidAmount: 0,
    duration: 0,
  });

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
      whiteListedTokens &&
      whiteListedTokens.length > 0 &&
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
    auctionForm.acceptedToken,
    auctionForm.duration,
    auctionForm.minBidAmount,
    auctionOptions,
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
        network,
      );
    }
  };

  return (
    <StyledAuctionModal>
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
    </StyledAuctionModal>
  );
};
