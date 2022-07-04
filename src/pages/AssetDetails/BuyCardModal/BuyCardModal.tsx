import { BigNumber } from 'ethers';
import { useState } from 'react';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import { useErc20 } from '../../../hooks/useErc20';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useBuyLsp8Token } from '../../../hooks/useBuyLsp8Token';
import { IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledApproveButton,
  StyledButtonGroup,
  StyledBuyButton,
  StyledBuyCardModalContent,
  StyledBuyStep,
  StyledBuyStepsContainer,
  StyledErrorMessage,
  StyledInfoText,
  StyledPaymentText,
  StyledProcessingWindow,
  StyledRadioGroup,
  StyledRadioInput,
  StyledRadioLabel,
  StyledSelectInputContainer,
  StyledUpAddressSelectInput,
  StyledUpAddressSelectLabel,
} from './styles';
import { isAddress } from 'ethers/lib/utils';

interface IProps {
  onClose: () => void;
  address: string;
  mint: number;
  price: BigNumber;
  cardImg: string;
  tokenAddress: string;
  whiteListedTokens: IWhiteListedTokens[];
  network: NetworkName;
}

export const BuyCardModal = ({
  address,
  onClose,
  mint,
  price,
  cardImg,
  tokenAddress,
  whiteListedTokens,
  network,
}: IProps) => {
  const { approve, isApproved, resetApproveState, approveError } = useErc20({
    tokenAddress,
    network,
  });
  const { buyFromMarket } = useBuyLsp8Token(address, network);
  const { getItems } = useLocalStorage();
  const savedProfiles = getItems(network);
  const savedProfilesAddresses = savedProfiles
    ? Object.keys(savedProfiles)
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
          <StyledApproveButton
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
          </StyledApproveButton>
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
      <StyledButtonGroup>
        <StyledBuyButton
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
        </StyledBuyButton>
      </StyledButtonGroup>
    </StyledBuyCardModalContent>
  );
};
