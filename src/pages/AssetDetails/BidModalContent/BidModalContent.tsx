import { BigNumberish } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { DateTime } from 'luxon';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { ModalContext } from '../../../context/ModalProvider';
import { useErc20 } from '../../../hooks/useErc20';
import {
  LOCAL_STORAGE_KEYS,
  useLocalStorage,
} from '../../../hooks/useLocalStorage';
import { useProfile } from '../../../hooks/useProfile';
import { useSubmitBid } from '../../../hooks/useSubmitBid';
import { auctionContracts } from '../../../services/controllers/Auction';
import { IAuctionMarket, ICard } from '../../../services/models';
import { convertPrice, displayPrice, STATUS } from '../../../utility';
import { Address } from '../../../utils/types';
import {
  StyledSelectInputContainer,
  StyledUpAddressSelectInput,
  StyledUpAddressSelectLabel,
} from '../BuyCardModal/styles';
import { ProfilePreview } from '../ProfilePreview';
import {
  StyledBidInfo,
  StyledBidInfoLabel,
  StyledBidInfoValue,
  StyledBidModalContent,
  StyledBidStep,
  StyledBidStepsContainer,
  StyledInfoText,
  StyledStepText,
} from './styles';

interface IProps {
  onDismiss: () => void;
  asset: ICard;
  auctionMarket: IAuctionMarket;
  network: NetworkName;
}

export const BidModalContent = ({
  onDismiss,
  asset,
  auctionMarket,
  network,
}: IProps) => {
  const { address: assetAddress, whiteListedTokens } = asset;
  const { onDismissCallback } = useContext(ModalContext);
  const [
    destinationProfile,
    profileAddressError,
    getProfile,
    isProfileLoading,
  ] = useProfile();
  const { isApproved, approve, resetApproveState } = useErc20({
    tokenAddress: auctionMarket.auction.acceptedToken,
    network,
  });
  const { bidingState, submitBid } = useSubmitBid(
    assetAddress,
    Number(auctionMarket.tokenId),
    network,
  );

  const { getItems } = useLocalStorage();
  const savedProfiles = getItems(LOCAL_STORAGE_KEYS.UP);
  const savedProfilesAddresses =
    savedProfiles && savedProfiles[network]
      ? Object.keys(savedProfiles[network])
      : null;

  const [bidForm, setBidForm] = useState<{
    upAddress: Address;
    bidAmount: BigNumberish;
  }>({
    upAddress:
      savedProfilesAddresses && savedProfilesAddresses.length > 0
        ? savedProfilesAddresses[0]
        : '',
    bidAmount: 0,
  });

  const marketToken =
    whiteListedTokens.length > 0 &&
    whiteListedTokens.find(
      (i) => i.tokenAddress === auctionMarket.auction.acceptedToken,
    );

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (event.currentTarget.name === 'bidAmount') {
      const bidAmount = convertPrice(event.currentTarget.value, 18);
      setBidForm({
        ...bidForm,
        bidAmount,
      });
    } else {
      setBidForm({
        ...bidForm,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const validateInput = useCallback(() => {
    if (
      isApproved &&
      whiteListedTokens &&
      whiteListedTokens.length > 0 &&
      isAddress(bidForm.upAddress) &&
      bidForm.bidAmount > auctionMarket.auction.minimumBid &&
      bidForm.bidAmount > auctionMarket.auction.activeBidAmount
    ) {
      return true;
    } else {
      return false;
    }
  }, [
    auctionMarket.auction.activeBidAmount,
    auctionMarket.auction.minimumBid,
    bidForm.bidAmount,
    bidForm.upAddress,
    isApproved,
    whiteListedTokens,
  ]);

  const onSubmit = async () => {
    if (!validateInput()) {
      await submitBid(Number(bidForm.bidAmount), bidForm.upAddress);
    }
  };

  useMemo(() => {
    getProfile(bidForm.upAddress, network);
  }, [bidForm.upAddress, getProfile, network]);

  useEffect(() => {
    bidingState === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bidingState]);

  return (
    <StyledBidModalContent>
      <StyledBidInfo>
        <StyledBidInfoLabel>Mint:</StyledBidInfoLabel>
        <StyledBidInfoValue>{Number(auctionMarket.tokenId)}</StyledBidInfoValue>
        <StyledBidInfoLabel>Min Bid:</StyledBidInfoLabel>
        <StyledBidInfoValue>
          {displayPrice(
            auctionMarket.auction.minimumBid,
            marketToken ? marketToken.decimals : 0,
          )}{' '}
          {marketToken ? marketToken.symbol : ''}
        </StyledBidInfoValue>
        <StyledBidInfoLabel>Current Bid:</StyledBidInfoLabel>
        <StyledBidInfoValue>
          {displayPrice(
            auctionMarket.auction.activeBidAmount,
            marketToken ? marketToken.decimals : 0,
          )}{' '}
          {marketToken ? marketToken.symbol : ''}
        </StyledBidInfoValue>
        <StyledBidInfoLabel>Ends at:</StyledBidInfoLabel>
        <StyledBidInfoValue>
          {DateTime.fromSeconds(auctionMarket.auction.endTime).toLocaleString(
            DateTime.DATETIME_SHORT,
          )}
        </StyledBidInfoValue>
      </StyledBidInfo>
      <ProfilePreview
        profile={destinationProfile}
        profileError={profileAddressError}
        isProfileLoading={isProfileLoading}
      />
      <StyledBidStepsContainer>
        <StyledBidStep>
          <StyledStepText>1. CHOOSE YOUR UP ADDRESS</StyledStepText>
          {savedProfilesAddresses ? (
            <StyledSelectInputContainer>
              <StyledUpAddressSelectLabel>
                UP Address
              </StyledUpAddressSelectLabel>
              <StyledUpAddressSelectInput onChange={changeHandler}>
                {savedProfilesAddresses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </StyledUpAddressSelectInput>
            </StyledSelectInputContainer>
          ) : (
            <InputField
              name="universalProfileAddress"
              label="UP Address"
              type="text"
              changeHandler={changeHandler}
              disabled={isApproved}
            />
          )}
        </StyledBidStep>
        <StyledBidStep>
          <StyledStepText>2. ENTER THE BID AMOUNT</StyledStepText>
          <InputField
            name="bidAmount"
            label="Bid Amount"
            type="number"
            changeHandler={changeHandler}
          />
          <StyledModalButton
            onClick={async () =>
              await approve(
                auctionContracts[network],
                Number(bidForm.bidAmount),
                network,
                bidForm.upAddress,
              )
            }
          >
            Check balance & Approve
          </StyledModalButton>
        </StyledBidStep>
        <StyledBidStep>
          <StyledStepText>3. CONFIRM BID</StyledStepText>
          <StyledInfoText>
            Do you confirm to bid on this card mint for{' '}
            {displayPrice(
              bidForm.bidAmount,
              marketToken ? marketToken.decimals : 0,
            )}{' '}
            {marketToken ? marketToken.symbol : ''}?
          </StyledInfoText>
        </StyledBidStep>
      </StyledBidStepsContainer>
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton disabled={!validateInput()} onClick={onSubmit}>
          Submit Bid
        </StyledModalButton>
      </StyledModalButtonsWrapper>
    </StyledBidModalContent>
  );
};
