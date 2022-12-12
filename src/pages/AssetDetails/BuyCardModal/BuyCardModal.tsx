import { useEffect, useState, useContext } from 'react';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import { useErc20 } from '../../../hooks/useErc20';
import {
  LOCAL_STORAGE_KEYS,
  useLocalStorage,
} from '../../../hooks/useLocalStorage';
import { useBuyLsp8Token } from '../../../hooks/useBuyLsp8Token';
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
  const { approve, isApproved, resetApproveState, approveError } = useErc20({
    tokenAddress,
    network,
  });
  const { buyFromMarket, buyState, resetState } = useBuyLsp8Token(
    address,
    network,
  );
  const { getItems } = useLocalStorage();
  const savedProfiles = getItems(LOCAL_STORAGE_KEYS.UP);
  const savedProfilesAddresses =
    savedProfiles && savedProfiles[network]
      ? Object.keys(savedProfiles[network])
      : null;
  const [upAddress, setUpAddress] = useState<string>(
    savedProfilesAddresses && savedProfilesAddresses.length > 0
      ? savedProfilesAddresses[0]
      : '',
  );
  const [paymentOption, setPaymentOption] = useState<string>('');

  const marketToken =
    whiteListedTokens &&
    whiteListedTokens.length > 0 &&
    whiteListedTokens.find((i) => i.tokenAddress === tokenAddress);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setUpAddress(event.currentTarget.value);
    resetApproveState();
  };

  const paymentChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentOption(event.target.value);
    resetApproveState();
  };

  const transactionStatesMessages = {
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
      description: 'Please try again.',
    },
  };

  useEffect(() => {
    buyState === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyState]);

  return (
    <StyledBuyCardModalContent>
      <CardPriceInfoForModal
        address={address}
        mint={mint}
        price={displayPrice(price, marketToken ? marketToken.decimals : 0)}
        cardImg={cardImg}
      />
      <StyledBuyStepsContainer>
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
                onChange={paymentChangeHandler}
              />{' '}
              Metamask
            </StyledRadioLabel>
          </StyledRadioGroup>
        </StyledBuyStep>
        <StyledBuyStep>
          <StyledPaymentText>
            2. CONFIRM ADDRESS & CHECK BALANCE
          </StyledPaymentText>
          {paymentOption === 'up' &&
            (savedProfilesAddresses ? (
              <StyledSelectInputContainer>
                <StyledUpAddressSelectLabel>
                  UP Address
                </StyledUpAddressSelectLabel>
                <StyledUpAddressSelectInput>
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
                disabled={paymentOption === 'up' && isApproved}
              />
            ))}
          <StyledModalButton
            disabled={
              ((paymentOption === 'up' || paymentOption === '') &&
                !isAddress(upAddress)) ||
              isApproved
            }
            onClick={async () =>
              await approve(
                address,
                price,
                network,
                paymentOption === 'up' ? upAddress : undefined,
              )
            }
          >
            Check balance & Approve
          </StyledModalButton>
          <StyledErrorMessage>{approveError}</StyledErrorMessage>
        </StyledBuyStep>
        <StyledBuyStep>
          <StyledPaymentText>3. CONFIRM PURCHASE</StyledPaymentText>
          <StyledInfoText>
            Do you confirm the purchase of this card mint for{' '}
            {displayPrice(price, marketToken ? marketToken.decimals : 0)}{' '}
            {marketToken ? marketToken.symbol : ''}?
          </StyledInfoText>
        </StyledBuyStep>
      </StyledBuyStepsContainer>
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          disabled={!isApproved}
          onClick={async () =>
            await buyFromMarket(
              address,
              price,
              mint,
              paymentOption === 'up' ? upAddress : undefined,
            )
          }
        >
          Buy
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={buyState}
        transactionMessages={transactionStatesMessages}
        callback={resetState}
      />
    </StyledBuyCardModalContent>
  );
};
