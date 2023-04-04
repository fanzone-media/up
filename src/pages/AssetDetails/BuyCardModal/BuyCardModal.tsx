import { useEffect, useState, useContext, useMemo } from 'react';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import {
  useErc20Allowance,
  useErc20Approve,
  useErc20Balance,
  LOCAL_STORAGE_KEYS,
  ReferrerAddressLocal,
  useLocalStorage,
  useBuyFromMarket,
} from '../../../hooks';
import { IWhiteListedTokens } from '../../../services/models';
import { displayPrice, STATUS } from '../../../utility';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledBuyCardModalContent,
  StyledBuyStep,
  StyledBuyStepsContainer,
  StyledErrorMessage,
  StyledInfoText,
  StyledPaymentText,
  StyledRadioGroup,
  StyledRadioInput,
  StyledRadioLabel,
  StyledSelectInputContainer,
  StyledUpAddressSelectInput,
  StyledUpAddressSelectLabel,
} from './styles';
import { isAddress } from 'ethers/lib/utils';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { ModalContext } from '../../../context/ModalProvider';
import { useAccount, useNetwork } from 'wagmi';
import { useUniversalProfile } from '../../../hooks/useUniversalProfile';
import { ethers } from 'ethers';
import {
  defaultReferrerAddress,
  WHITE_LISTED_TOKENS,
} from '../../../utility/content/addresses';

interface IProps {
  onDismiss: () => void;
  address: string;
  mint: number;
  price: number;
  cardImg: string;
  tokenAddress: string;
  whiteListedTokens: IWhiteListedTokens[];
  network: NetworkName;
}

export const BuyCardModal = ({
  address,
  onDismiss,
  mint,
  price,
  cardImg,
  tokenAddress,
  whiteListedTokens,
  network,
}: IProps) => {
  const { onDismissCallback } = useContext(ModalContext);

  const { address: metamaskAddress, isConnected } = useAccount();
  const { chain } = useNetwork();

  const { getItems } = useLocalStorage();

  const savedProfiles = getItems(LOCAL_STORAGE_KEYS.UP);
  const savedProfilesAddresses =
    savedProfiles && savedProfiles[network]
      ? Object.keys(savedProfiles[network])
      : null;

  const localReferrerAddress = getItems(
    LOCAL_STORAGE_KEYS.REFERRER,
  ) as ReferrerAddressLocal;
  const referrerAddress =
    localReferrerAddress &&
    localReferrerAddress[network] &&
    isAddress(localReferrerAddress[network])
      ? localReferrerAddress[network]
      : defaultReferrerAddress[network];

  const [upAddress, setUpAddress] = useState<string>(
    savedProfilesAddresses && savedProfilesAddresses.length > 0
      ? savedProfilesAddresses[0]
      : '',
  );
  const [paymentOption, setPaymentOption] = useState<string>('mm');

  const [approveStatus, setApproveStatus] = useState<STATUS>(STATUS.IDLE);
  const [buyStatus, setBuyStatus] = useState<STATUS>(STATUS.IDLE);

  const { data: universalProfile } = useUniversalProfile(
    isAddress(upAddress) ? upAddress : ethers.constants.AddressZero,
    network,
  );
  const { data: balances, isLoading: isLoadingBalances } = useErc20Balance(
    [tokenAddress],
    paymentOption === 'up' ? upAddress : metamaskAddress!,
    network,
  );
  const { data: allowance, isLoading: isLoadingAllowance } = useErc20Allowance(
    tokenAddress,
    paymentOption === 'up' ? upAddress : metamaskAddress!,
    address,
    network,
  );

  const {
    approve,
    isApproved,
    error: approveError,
  } = useErc20Approve(
    {
      spenderAddress: address,
      erc20Token: tokenAddress,
      network,
    },
    {
      onMutate() {
        setApproveStatus(STATUS.LOADING);
      },
      onSuccess() {
        setApproveStatus(STATUS.SUCCESSFUL);
      },
      onError() {
        setApproveStatus(STATUS.FAILED);
      },
    },
  );

  const { buyFromMarket, error: buyError } = useBuyFromMarket(
    {
      lsp8Address: address,
      mintNumber: mint,
      referrer: referrerAddress,
      network,
    },
    {
      onMutate() {
        setBuyStatus(STATUS.LOADING);
      },
      onSuccess() {
        setBuyStatus(STATUS.SUCCESSFUL);
      },
      onError() {
        setBuyStatus(STATUS.FAILED);
      },
    },
  );

  const loadingData = useMemo(
    () => isLoadingBalances || isLoadingAllowance,
    [isLoadingBalances, isLoadingAllowance],
  );

  const isCorrectNetwork = isConnected && chain?.name.toLowerCase() === network;

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setUpAddress(event.currentTarget.value);
    // resetApproveState();
  };

  const paymentChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentOption(event.target.value);
    // resetApproveState();
  };

  const approveTransactionStatesMessages = useMemo(
    () => ({
      loading: {
        mainHeading: 'Approval in progress',
        description:
          'In a few moments you will know if the approval was successful.',
      },
      successful: {
        mainHeading: 'Approval successful!',
        description: 'Now you can proceed to buy the card',
        callback: () => setApproveStatus(STATUS.IDLE),
      },
      failed: {
        mainHeading: 'Approval failed',
        description: approveError ? approveError : 'Please try again.',
        callback: () => setApproveStatus(STATUS.IDLE),
      },
    }),
    [approveError],
  );

  const buyTransactionStatesMessages = useMemo(
    () => ({
      loading: {
        mainHeading: 'Purchase is being verified',
        description:
          'In a few moments you will know if the purchase was successful.',
      },
      successful: {
        mainHeading: 'Purchase successful!',
        description:
          'The card will appear in your Universal Profile in the next ... hours',
      },
      failed: {
        mainHeading: 'Purchase failed',
        description: buyError ? buyError : 'Please try again.',
        callback: () => setBuyStatus(STATUS.IDLE),
      },
    }),
    [buyError],
  );

  useEffect(() => {
    buyStatus === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyStatus]);

  return (
    <StyledBuyCardModalContent>
      <CardPriceInfoForModal
        address={address}
        mint={mint}
        price={displayPrice(
          price,
          WHITE_LISTED_TOKENS[network][tokenAddress.toLowerCase()].decimals,
        )}
        cardImg={cardImg}
      />
      <StyledBuyStepsContainer>
        {!isConnected && (
          <StyledErrorMessage>wallet not connected</StyledErrorMessage>
        )}
        {!isCorrectNetwork && (
          <StyledErrorMessage>
            connected to wrong network ({chain?.name})
          </StyledErrorMessage>
        )}
        <StyledBuyStep>
          <StyledPaymentText>1. CHOOSE PAYMENT METHOD</StyledPaymentText>
          <StyledRadioGroup>
            <StyledRadioLabel htmlFor="up" $checked={paymentOption === 'up'}>
              <StyledRadioInput
                name="payment"
                type="radio"
                id="up"
                value="up"
                onChange={paymentChangeHandler}
              />{' '}
              Universal Profile
            </StyledRadioLabel>
            <StyledRadioLabel htmlFor="mm" $checked={paymentOption === 'mm'}>
              <StyledRadioInput
                name="payment"
                type="radio"
                id="mm"
                value="mm"
                defaultChecked
                onChange={paymentChangeHandler}
              />{' '}
              Metamask
            </StyledRadioLabel>
          </StyledRadioGroup>
        </StyledBuyStep>
        <StyledBuyStep>
          <StyledPaymentText>2. CONFIRM ADDRESS & APPROVE</StyledPaymentText>
          {paymentOption === 'up' &&
            (savedProfilesAddresses ? (
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
                value={upAddress}
                disabled={paymentOption === 'up' && isApproved}
              />
            ))}
          <StyledModalButton
            disabled={
              loadingData ||
              !isConnected ||
              !isCorrectNetwork ||
              !balances ||
              !allowance ||
              (paymentOption === 'up' && !isAddress(upAddress)) ||
              isApproved ||
              (balances && balances[0].balance < price) ||
              (allowance && allowance.allowance >= price)
            }
            onClick={() =>
              approve({
                amount: price,
                executeVia:
                  paymentOption === 'mm'
                    ? { type: 'Eoa' }
                    : universalProfile && universalProfile.isOwnerKeyManager
                    ? {
                        type: 'Key_Manager',
                        upOwnerAddress: universalProfile.owner,
                        upAddress: universalProfile.address,
                      }
                    : { type: 'Universal_Profile', upAddress },
              })
            }
          >
            Approve
          </StyledModalButton>
          {!loadingData && balances && balances[0].balance < price && (
            <StyledErrorMessage>
              you don't have enough balance
            </StyledErrorMessage>
          )}
          {!loadingData &&
            balances &&
            balances[0].balance >= price &&
            allowance &&
            allowance.allowance < price && (
              <StyledErrorMessage>
                you don't have the amount approved for the purchase
              </StyledErrorMessage>
            )}
        </StyledBuyStep>
        <StyledBuyStep>
          <StyledPaymentText>3. CONFIRM PURCHASE</StyledPaymentText>
          <StyledInfoText>
            Do you confirm the purchase of this card mint for{' '}
            {displayPrice(
              price,
              WHITE_LISTED_TOKENS[network][tokenAddress.toLowerCase()].decimals,
            )}{' '}
            {WHITE_LISTED_TOKENS[network][tokenAddress.toLowerCase()].symbol}
          </StyledInfoText>
        </StyledBuyStep>
      </StyledBuyStepsContainer>
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          disabled={
            loadingData ||
            !isConnected ||
            !isCorrectNetwork ||
            !balances ||
            !allowance ||
            (!isApproved &&
              ((balances && balances[0].balance < price) ||
                (allowance && allowance.allowance < price)))
          }
          onClick={async () =>
            await buyFromMarket({
              price,
              acceptedToken: tokenAddress,
              executeVia:
                paymentOption === 'mm'
                  ? { type: 'Eoa' }
                  : universalProfile && universalProfile.isOwnerKeyManager
                  ? {
                      type: 'Key_Manager',
                      upOwnerAddress: universalProfile.owner,
                      upAddress: universalProfile.address,
                    }
                  : { type: 'Universal_Profile', upAddress },
            })
          }
        >
          Buy
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={approveStatus}
        transactionMessages={approveTransactionStatesMessages}
      />
      <TransactionStateWindow
        state={buyStatus}
        transactionMessages={buyTransactionStatesMessages}
      />
    </StyledBuyCardModalContent>
  );
};
