import React, { useMemo, useState, useContext, useEffect } from 'react';
import { NetworkName } from '../../../boot/types';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledErrorMessage,
  StyledInputGroup,
  StyledSellCardModalContent,
  StyledTokenSelectorDropDown,
} from './styles';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { InputField } from '../../../components/InputField';
import { displayPrice, STATUS } from '../../../utility';
import { WHITE_LISTED_TOKENS } from '../../../utility/content/addresses';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { ModalContext } from '../../../context/ModalProvider';
import { useSetForSale } from '../../../hooks';
import { useAccount, useNetwork } from 'wagmi';

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
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const whiteListedTokensAddress = Object.keys(WHITE_LISTED_TOKENS[network]);

  const [sellForm, setSellForm] = useState<{
    amount: number;
    tokenAddress: string;
  }>({
    amount: 0,
    tokenAddress: whiteListedTokensAddress[0],
  });
  const [sellStatus, setSellStatus] = useState<STATUS>(STATUS.IDLE);
  const isMarketAlreadySet = !!price && !!marketTokenAddress;
  const isCorrectNetwork = chain?.name.toLowerCase() === network;

  const { setForSale, error: sellError } = useSetForSale(
    {
      lsp8Address: address,
      mintNumber: mint,
      network,
    },
    {
      onMutate() {
        setSellStatus(STATUS.LOADING);
      },
      onSuccess() {
        setSellStatus(STATUS.SUCCESSFUL);
      },
      onError() {
        setSellStatus(STATUS.FAILED);
      },
    },
  );

  const { onDismissCallback } = useContext(ModalContext);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSellForm({
      ...sellForm,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const transactionStatesMessages = useMemo(
    () => ({
      loading: {
        mainHeading: 'SETTING FOR SALE...',
      },
      successful: {
        mainHeading: 'SUCCESSFULLY SET FOR SALE',
      },
      failed: {
        mainHeading: 'SOMETHING WENT WRONG',
        description: sellError ? sellError : undefined,
        callback: () => setSellStatus(STATUS.IDLE),
      },
    }),
    [sellError],
  );

  useEffect(() => {
    sellStatus === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellStatus]);

  return (
    <StyledSellCardModalContent>
      <CardPriceInfoForModal
        address={address}
        mint={mint}
        price={
          isMarketAlreadySet
            ? displayPrice(
                price,
                WHITE_LISTED_TOKENS[network][marketTokenAddress.toLowerCase()]
                  .decimals,
              )
            : undefined
        }
        cardImg={cardImg}
      />
      {whiteListedTokens && (
        <>
          {!isConnected && (
            <StyledErrorMessage>wallet not connected</StyledErrorMessage>
          )}

          {isConnected && !isCorrectNetwork && (
            <StyledErrorMessage>
              connected to wrong network ({chain?.name})
            </StyledErrorMessage>
          )}
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
              {whiteListedTokensAddress?.map((item, i) => (
                <option
                  key={i}
                  value={item}
                  selected={
                    item.toLowerCase() === sellForm.tokenAddress.toLowerCase()
                  }
                >
                  {WHITE_LISTED_TOKENS[network][item].symbol}
                </option>
              ))}
            </StyledTokenSelectorDropDown>
          </StyledInputGroup>
        </>
      )}
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          onClick={() =>
            setForSale({
              price: sellForm.amount,
              acceptedToken: sellForm.tokenAddress,
              executeVia:
                ownerProfile && ownerProfile.isOwnerKeyManager
                  ? {
                      type: 'Key_Manager',
                      upOwnerAddress: ownerProfile.owner,
                      upAddress: ownerProfile.address,
                    }
                  : {
                      type: 'Universal_Profile',
                      upAddress: ownerProfile.address,
                    },
            })
          }
          disabled={
            !isConnected ||
            !isCorrectNetwork ||
            !whiteListedTokens ||
            whiteListedTokens?.length === 0 ||
            sellForm.amount <= 0
          }
        >
          Set for sale
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={sellStatus}
        transactionMessages={transactionStatesMessages}
      />
    </StyledSellCardModalContent>
  );
};
