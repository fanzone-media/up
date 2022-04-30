import React, { useEffect, useState } from 'react';
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
  StyledPriceInput,
  StyledPriceLabel,
  StyledSellCardModalContent,
  StyledSetPriceButton,
  StyledTokenSelectorDropDown,
} from './styles';
import { IProfile } from '../../../services/models';

interface IProps {
  onClose: () => void;
  address: string;
  mint: number;
  price?: number;
  cardImg: string;
  ownerProfile: IProfile;
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
}: IProps) => {
  const params = useParams<IParams>();
  const [whiteListedTokens, setWhiteListedTokens] =
    useState<{ tokenAddress: string; symbol: string }[]>();
  const [sellForm, setSellForm] = useState({
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

  const setCardForSale = async () => {
    if (ownerProfile.isOwnerKeyManager && signer) {
      await KeyManagerApi.setCardMarketViaKeyManager(
        params.add,
        ownerProfile.address,
        ownerProfile.owner,
        mint,
        sellForm.tokenAddress,
        sellForm.amount,
        signer,
      );
    }
    if (!ownerProfile.isOwnerKeyManager && signer) {
      await LSP4DigitalAssetApi.setMarketViaUniversalProfile(
        address,
        ownerProfile.address,
        mint,
        sellForm.tokenAddress,
        sellForm.amount,
        signer,
      );
    }
  };

  useEffect(() => {
    LSP4DigitalAssetApi.fetchAcceptedTokens(params.add, params.network)
      .then((res) => {
        setWhiteListedTokens(res);
      })
      .catch(() => {});
  }, [params.add, params.network]);

  return (
    <ModalOverlay onClose={onClose}>
      <StyledSellCardModalContent>
        <StyledModalHeader>SET CARD FOR SALE</StyledModalHeader>
        <CardPriceInfoForModal
          address={address}
          mint={mint}
          price={price}
          cardImg={cardImg}
        />
        <StyledInputGroup>
          <StyledPriceLabel>Your price</StyledPriceLabel>
          <StyledPriceInput
            name="amount"
            type="number"
            step="any"
            onChange={changeHandler}
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
