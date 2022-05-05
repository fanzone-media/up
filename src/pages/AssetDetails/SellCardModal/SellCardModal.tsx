import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSigner } from 'wagmi';
import { NetworkName } from '../../../boot/types';
import { ModalOverlay } from '../../../components/ModalOverlay';
import { LSP4DigitalAssetApi } from '../../../services/controllers/LSP4DigitalAsset';
import { KeyManagerApi } from '../../../services/controllers/KeyManager';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledButtonGroup,
  StyledCancelButton,
  StyledInputGroup,
  StyledModalHeader,
  StyledSellCardModalContent,
  StyledSetPriceButton,
  StyledTokenSelectorDropDown,
} from './styles';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { InputField } from '../../../components/InputField';
import { convertPrice, displayPrice } from '../../../utility';
import { BigNumber, BigNumberish } from 'ethers';

interface IProps {
  onClose: () => void;
  address: string;
  mint: number;
  marketTokenAddress?: string;
  price?: BigNumber;
  cardImg: string;
  ownerProfile: IProfile;
  whiteListedTokens?: IWhiteListedTokens[];
}

interface IParams {
  add: string;
  network: NetworkName;
  id: string;
}

export const SellCardModal = ({
  address,
  onClose,
  mint,
  price,
  cardImg,
  ownerProfile,
  whiteListedTokens,
  marketTokenAddress,
}: IProps) => {
  const params = useParams<IParams>();
  const [sellForm, setSellForm] = useState<{
    amount: BigNumberish;
    tokenAddress: string;
  }>({
    amount: 0,
    tokenAddress: whiteListedTokens ? whiteListedTokens[0].tokenAddress : '',
  });
  const [{ data: signer }] = useSigner();

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

  const setCardForSale = async () => {
    if (ownerProfile.isOwnerKeyManager && signer) {
      await KeyManagerApi.setCardMarketViaKeyManager(
        params.add,
        ownerProfile.address,
        ownerProfile.owner,
        mint,
        sellForm.tokenAddress,
        convertPrice(sellForm.amount, selectedTokenDecimals),
        signer,
      );
    }
    if (!ownerProfile.isOwnerKeyManager && signer) {
      await LSP4DigitalAssetApi.setMarketViaUniversalProfile(
        address,
        ownerProfile.address,
        mint,
        sellForm.tokenAddress,
        convertPrice(sellForm.amount, selectedTokenDecimals),
        signer,
      );
    }
  };

  useEffect(() => {}, []);

  return (
    <ModalOverlay onClose={onClose}>
      <StyledSellCardModalContent>
        <StyledModalHeader>SET CARD FOR SALE</StyledModalHeader>
        <CardPriceInfoForModal
          address={address}
          mint={mint}
          price={
            price &&
            displayPrice(price, marketTokenDecimals ? marketTokenDecimals : 0)
          }
          cardImg={cardImg}
        />
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
            <option>Token</option>
            {whiteListedTokens?.map((item, i) => (
              <option key={i} value={item.tokenAddress}>
                {item.symbol}
              </option>
            ))}
          </StyledTokenSelectorDropDown>
        </StyledInputGroup>
        <StyledButtonGroup>
          <StyledSetPriceButton onClick={setCardForSale}>
            Set for sale
          </StyledSetPriceButton>
          <StyledCancelButton onClick={onClose}>Cancel</StyledCancelButton>
        </StyledButtonGroup>
      </StyledSellCardModalContent>
    </ModalOverlay>
  );
};
