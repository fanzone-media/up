import { ModalOverlay } from '../../../components/ModalOverlay';
import { ICard } from '../../../services/models';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledButtonGroup,
  StyledBuyButton,
  StyledBuyCardModalContent,
  StyledCancelButton,
  StyledInfoText,
  StyledModalHeader,
} from './styles';

interface IProps {
  onClose: () => void;
  address: string;
  mint: number;
  price?: number;
  cardImg: string;
}

export const BuyCardModal = ({
  address,
  onClose,
  mint,
  price,
  cardImg,
}: IProps) => {
  return (
    <ModalOverlay onClose={onClose}>
      <StyledBuyCardModalContent>
        <StyledModalHeader>BUY CARD</StyledModalHeader>
        <CardPriceInfoForModal
          address={address}
          mint={mint}
          price={price}
          cardImg={cardImg}
        />
        <StyledInfoText>
          Do you confirm the purchase of this card mint for xxx WETH?
        </StyledInfoText>
        <StyledButtonGroup>
          <StyledBuyButton>Buy</StyledBuyButton>
          <StyledCancelButton onClick={onClose}>Cancel</StyledCancelButton>
        </StyledButtonGroup>
      </StyledBuyCardModalContent>
    </ModalOverlay>
  );
};
