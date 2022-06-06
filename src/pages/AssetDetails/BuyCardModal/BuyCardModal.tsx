import { BigNumber } from 'ethers';
import { useState } from 'react';
import { NetworkName } from '../../../boot/types';
import { InputField } from '../../../components/InputField';
import { ModalOverlay } from '../../../components/ModalOverlay';
import { useErc20 } from '../../../hooks/useErc20';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useSellBuyLsp8Token } from '../../../hooks/useSellBuyLsp8Token';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledApproveButton,
  StyledButtonGroup,
  StyledBuyButton,
  StyledBuyCardModalContent,
  StyledCancelButton,
  StyledInfoText,
  StyledModalHeader,
  StyledSelectInputContainer,
  StyledToggleButton,
  StyledToggleButtonGroup,
  StyledUpAddressSelectInput,
  StyledUpAddressSelectLabel,
} from './styles';

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
  const { approve } = useErc20({ tokenAddress, network });
  const { buyFromMarket } = useSellBuyLsp8Token(address, network);
  const { getItems } = useLocalStorage();
  const savedProfiles = getItems();
  const savedProfilesAddresses = savedProfiles
    ? Object.keys(savedProfiles)
    : null;
  const [upAddress, setUpAddress] = useState<string>(
    savedProfilesAddresses && savedProfilesAddresses.length > 0
      ? savedProfilesAddresses[0]
      : '',
  );
  const [toggleEOABuy, setToggleEOABuy] = useState<boolean>(false);

  const marketToken =
    whiteListedTokens &&
    whiteListedTokens.length > 0 &&
    whiteListedTokens.find((i) => i.tokenAddress === tokenAddress);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setUpAddress(event.currentTarget.value);
  };

  return (
    <StyledBuyCardModalContent>
      <CardPriceInfoForModal
        address={address}
        mint={mint}
        price={displayPrice(price, marketToken ? marketToken.decimals : 0)}
        cardImg={cardImg}
      />
      <StyledToggleButtonGroup>
        <StyledToggleButton
          $active={!toggleEOABuy}
          onClick={() => setToggleEOABuy(false)}
        >
          With UP
        </StyledToggleButton>
        <StyledToggleButton
          $active={toggleEOABuy}
          onClick={() => setToggleEOABuy(true)}
        >
          With EOA
        </StyledToggleButton>
      </StyledToggleButtonGroup>
      {!toggleEOABuy &&
        (savedProfilesAddresses ? (
          <StyledSelectInputContainer>
            <StyledUpAddressSelectLabel>UP Address</StyledUpAddressSelectLabel>
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
          />
        ))}
      <StyledApproveButton
        onClick={async () =>
          await approve(
            address,
            price,
            network,
            !toggleEOABuy ? upAddress : undefined,
          )
        }
      >
        Check balance & Approve
      </StyledApproveButton>
      <StyledInfoText>
        Do you confirm the purchase of this card mint for{' '}
        {displayPrice(price, marketToken ? marketToken.decimals : 0)}{' '}
        {marketToken ? marketToken.symbol : ''}?
      </StyledInfoText>
      <StyledButtonGroup>
        <StyledBuyButton
          onClick={async () =>
            await buyFromMarket(
              address,
              price,
              mint,
              !toggleEOABuy ? upAddress : undefined,
            )
          }
        >
          Buy
        </StyledBuyButton>
      </StyledButtonGroup>
    </StyledBuyCardModalContent>
  );
};
