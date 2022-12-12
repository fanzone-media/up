import React, { useMemo, useState, useContext, useEffect } from 'react';
import { NetworkName } from '../../../boot/types';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledInputGroup,
  StyledSellCardModalContent,
  StyledTokenSelectorDropDown,
} from './styles';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { InputField } from '../../../components/InputField';
import { displayPrice, STATUS } from '../../../utility';
import { BigNumberish } from 'ethers';
import { useSellLsp8Token } from '../../../hooks/useSellLsp8Token';
import { getWhiteListedTokenAddresses } from '../../../utility/content/addresses';
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
  marketTokenAddress?: string;
  price?: number;
  cardImg: string;
  ownerProfile: IProfile;
  whiteListedTokens?: IWhiteListedTokens[];
  network: NetworkName;
}

export const SellCardModal = ({
  address,
  onDismiss,
  mint,
  price,
  cardImg,
  ownerProfile,
  whiteListedTokens,
  marketTokenAddress,
  network,
}: IProps) => {
  const [sellForm, setSellForm] = useState<{
    amount: BigNumberish;
    tokenAddress: string;
  }>({
    amount: 0,
    tokenAddress:
      whiteListedTokens && whiteListedTokens.length > 0
        ? whiteListedTokens[0].tokenAddress
        : '',
  });
  const { setForSale, sellState } = useSellLsp8Token();
  const { onDismissCallback } = useContext(ModalContext);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSellForm({
      ...sellForm,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const selectedTokenDecimals = useMemo(() => {
    const selectedToken =
      whiteListedTokens &&
      whiteListedTokens.find(
        (item) => item.tokenAddress === sellForm.tokenAddress,
      );
    if (selectedToken) {
      return selectedToken.decimals;
    }
    return 1;
  }, [sellForm.tokenAddress, whiteListedTokens]);

  const marketTokenDecimals =
    whiteListedTokens &&
    whiteListedTokens.find((i) => i.tokenAddress === marketTokenAddress)
      ?.decimals;

  const whiteListedtokensAddresses = getWhiteListedTokenAddresses(network);

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'SETTING FOR SALE...',
    },
    successful: {
      mainHeading: 'SUCCESSFULLY SET FOR SALE',
    },
    failed: {
      mainHeading: 'SOMETHING WENT WRONG',
    },
  };

  useMemo(() => {
    sellState === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
  }, [onDismissCallback, sellState]);

  return (
    <StyledSellCardModalContent>
      <CardPriceInfoForModal
        address={address}
        mint={mint}
        price={
          price &&
          displayPrice(price, marketTokenDecimals ? marketTokenDecimals : 0)
        }
        cardImg={cardImg}
      />
      {whiteListedTokens && (
        <StyledInputGroup>
          <InputField
            name="amount"
            label="Your Price"
            type="number"
            changeHandler={changeHandler}
          />
          <StyledTokenSelectorDropDown
            name="tokenAddress"
            onChange={changeHandler}
          >
            {whiteListedTokens?.map((item, i) => (
              <option
                key={i}
                value={item.tokenAddress}
                selected={
                  item.tokenAddress.toLowerCase() ===
                  whiteListedtokensAddresses[0].toLowerCase()
                }
              >
                {item.symbol}
              </option>
            ))}
          </StyledTokenSelectorDropDown>
        </StyledInputGroup>
      )}
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          onClick={() =>
            setForSale(
              address,
              ownerProfile,
              mint,
              sellForm.tokenAddress,
              sellForm.amount,
              selectedTokenDecimals,
              network,
            )
          }
          disabled={
            !whiteListedTokens ||
            whiteListedTokens?.length === 0 ||
            sellForm.amount <= 0
          }
        >
          Set for sale
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={sellState}
        transactionMessages={transactionStatesMessages}
      />
    </StyledSellCardModalContent>
  );
};
