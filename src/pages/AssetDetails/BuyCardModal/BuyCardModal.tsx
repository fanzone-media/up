import { BigNumber, BigNumberish } from 'ethers';
import { useState } from 'react';
import { InputField } from '../../../components/InputField';
import { ModalOverlay } from '../../../components/ModalOverlay';
import { useErc20 } from '../../../hooks/useErc20';
import { useSellBuyLsp8Token } from '../../../hooks/useSellBuyLsp8Token';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { IWhiteListedTokens } from '../../../services/models';
import { convertPrice, displayPrice } from '../../../utility';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledApproveButton,
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
  price: BigNumber;
  cardImg: string;
  tokenAddress: string;
  whiteListedTokens: IWhiteListedTokens[];
}

export const BuyCardModal = ({
  address,
  onClose,
  mint,
  price,
  cardImg,
  tokenAddress,
  whiteListedTokens,
}: IProps) => {
  const { network } = useUrlParams();
  const { approve } = useErc20({ tokenAddress, network });
  const { buyFromMarket } = useSellBuyLsp8Token(address, network);
  const [upAddress, setUpAddress] = useState<string>('');

  const marketTokenDecimals =
    whiteListedTokens &&
    whiteListedTokens.find((i) => i.tokenAddress === tokenAddress)?.decimals;

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpAddress(event.currentTarget.value);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <StyledBuyCardModalContent>
        <StyledModalHeader>BUY CARD</StyledModalHeader>
        <CardPriceInfoForModal
          address={address}
          mint={mint}
          price={displayPrice(
            price,
            marketTokenDecimals ? marketTokenDecimals : 0,
          )}
          cardImg={cardImg}
        />
        <InputField
          name="universalProfileAddress"
          label="UP Address"
          type="text"
          changeHandler={changeHandler}
        />
        <StyledApproveButton
          onClick={async () =>
            await approve(
              upAddress,
              address,
              convertPrice(
                price,
                marketTokenDecimals ? marketTokenDecimals : 0,
              ),
              network,
            )
          }
        >
          Check balance & Approve
        </StyledApproveButton>
        <StyledInfoText>
          Do you confirm the purchase of this card mint for xxx WETH?
        </StyledInfoText>
        <StyledButtonGroup>
          <StyledBuyButton
            onClick={async () =>
              await buyFromMarket(
                upAddress,
                address,
                convertPrice(
                  price,
                  marketTokenDecimals ? marketTokenDecimals : 0,
                ),
                mint,
              )
            }
          >
            Buy
          </StyledBuyButton>
          <StyledCancelButton onClick={onClose}>Cancel</StyledCancelButton>
        </StyledButtonGroup>
      </StyledBuyCardModalContent>
    </ModalOverlay>
  );
};
