import { useEffect, useContext } from 'react';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { ModalContext } from '../../../context/ModalProvider';
import { useRemoveMarketForLsp8Token } from '../../../hooks/useRemoveMarketForLsp8Token';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { displayPrice, STATUS } from '../../../utility';
import { Address } from '../../../utils/types';
import { CardPriceInfoForModal } from '../components/CardPriceInfoForModal';
import {
  StyledWithdrawCardSaleModalContent,
  StyledWithdrawFromSaleText,
} from './styles';

interface IProps {
  assetAddress: Address;
  tokenId: string;
  cardImg: string;
  price?: number;
  profile?: IProfile;
  marketTokenAddress?: string;
  whiteListedTokens?: IWhiteListedTokens[];
  onDismiss: () => void;
}

export const WithdrawCardSaleModalContent = ({
  assetAddress,
  tokenId,
  cardImg,
  price,
  profile,
  marketTokenAddress,
  whiteListedTokens,
  onDismiss,
}: IProps) => {
  const { onDismissCallback } = useContext(ModalContext);
  const { removeMarketState, removeMarket } = useRemoveMarketForLsp8Token(
    assetAddress,
    parseInt(tokenId),
    profile ? profile : ({} as IProfile),
  );

  const marketTokenDecimals =
    whiteListedTokens &&
    whiteListedTokens.find((i) => i.tokenAddress === marketTokenAddress)
      ?.decimals;

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'WITHDRAWING FROM SALE...',
    },
    successful: {
      mainHeading: 'SUCCESSFULLY WITHDRAWN FROM SALE',
    },
    failed: {
      mainHeading: 'SOMETHING WENT WRONG',
    },
  };

  useEffect(() => {
    removeMarketState === STATUS.SUCCESSFUL &&
      onDismissCallback(() => window.location.reload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeMarketState]);

  return (
    <StyledWithdrawCardSaleModalContent>
      <CardPriceInfoForModal
        address={assetAddress}
        mint={Number(tokenId)}
        price={
          price &&
          displayPrice(price, marketTokenDecimals ? marketTokenDecimals : 0)
        }
        cardImg={cardImg}
      />
      <StyledWithdrawFromSaleText>
        Are you sure you want to withdraw the card from sale?
      </StyledWithdrawFromSaleText>
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton onClick={() => removeMarket()}>
          Withdraw
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        state={removeMarketState}
        transactionMessages={transactionStatesMessages}
      />
    </StyledWithdrawCardSaleModalContent>
  );
};
