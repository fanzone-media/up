import React from 'react';
import {
  StyledCardImg,
  StyledCardPriceInfoContainer,
  StyledInfo,
  StyledInfoLabel,
  StyledInfoValue,
} from './styles';

interface IProps {
  cardImg: string;
  address: string;
  mint?: number;
  price?: number;
}

export const CardPriceInfoForModal = ({
  cardImg,
  address,
  mint,
  price,
}: IProps) => {
  return (
    <StyledCardPriceInfoContainer>
      <StyledCardImg src={cardImg} alt="" />
      <StyledInfo>
        <StyledInfoLabel>Address:</StyledInfoLabel>
        <StyledInfoValue>
          {address.slice(0, 8)}...
          {address.slice(address.length - 4, address.length)}
        </StyledInfoValue>
        <StyledInfoLabel>Mint:</StyledInfoLabel>
        <StyledInfoValue>{mint}</StyledInfoValue>
        <StyledInfoLabel>Price:</StyledInfoLabel>
        <StyledInfoValue>{price?.toString()}</StyledInfoValue>
      </StyledInfo>
    </StyledCardPriceInfoContainer>
  );
};
