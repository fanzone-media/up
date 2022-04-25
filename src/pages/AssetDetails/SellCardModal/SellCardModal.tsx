import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSigner } from 'wagmi';
import { NetworkName } from '../../../boot/types';
import { ModalOverlay } from '../../../components/ModalOverlay';
// import { KeyManagerApi } from '../../../services/controllers/KeyManager';
// import { LSP4DigitalAssetApi } from '../../../services/controllers/LSP4DigitalAsset';
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
} from './styles';

interface IProps {
  onClose: () => void;
  address: string;
  mint: number;
  price?: number;
  cardImg: string;
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
}: IProps) => {
  //   const params = useParams<IParams>();
  const [amount, setAmount] = useState<number>(0);
  //   const [{ data: signer }] = useSigner();

  //   const whiteListedTokenAddress = {
  //     l14: '',
  //     mumbai: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
  //     ethereum: '',
  //     polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  //   };

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.currentTarget.value));
  };

  //   const setCardForSale = async () => {
  //     if (profile.isOwnerKeyManager) {
  //       await KeyManagerApi.setCardMarketViaKeyManager(
  //         params.add,
  //         profile.address,
  //         profile.owner,
  //         Number(params.id),
  //         whiteListedTokenAddress[params.network],
  //         amount,
  //         signer,
  //       );
  //     } else {
  //       await LSP4DigitalAssetApi.sellCard(
  //         address,
  //         Number(mint),
  //         whiteListedTokenAddress[params.network],
  //         amount,
  //         params.network,
  //       );
  //     }
  //   };

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
          <StyledPriceInput type="number" step="any" onChange={changeHandler} />
        </StyledInputGroup>

        <StyledButtonGroup>
          <StyledSetPriceButton>Set for sale</StyledSetPriceButton>
          <StyledCancelButton onClick={onClose}>Cancel</StyledCancelButton>
        </StyledButtonGroup>
      </StyledSellCardModalContent>
    </ModalOverlay>
  );
};
