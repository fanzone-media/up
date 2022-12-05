import { useAccount } from 'wagmi';
import { MintMarketType } from '../../../hooks/useMintMarket';
import { useModal } from '../../../hooks/useModal';
import { useRemoveMarketForLsp8Token } from '../../../hooks/useRemoveMarketForLsp8Token';
import { useTransferLsp8Token } from '../../../hooks/useTransferLsp8Token';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { ICard, IPermissionSet, IProfile } from '../../../services/models';
import { displayPrice, STATUS } from '../../../utility';
import { AuctionModalContent } from '../AuctionModalContent';
import { BuyCardButton } from '../components/BuyCardButton';
import { SellCardModal } from '../SellCardModal';
import {
  StyledActionsButtonWrapper,
  StyledCardPriceValue,
  StyledCardPriceValueWrapper,
  StyledChangePriceButton,
  StyledSetForAuctionButton,
  StyledSetPriceButton,
  StyledWithdrawButton,
} from './styles';

interface IProps {
  asset: ICard | null;
  activeProfile: IProfile | null;
  currentUsersPermissions: IPermissionSet['permissions'];
  marketForTokenId: MintMarketType | null;
}

export const AssetActions = ({
  asset,
  activeProfile,
  currentUsersPermissions,
  marketForTokenId,
}: IProps) => {
  const { network, address, tokenId } = useUrlParams();
  const [{ data: account }] = useAccount();

  const { transferCard, transferState } = useTransferLsp8Token(
    address,
    account ? account.address : '',
    Number(tokenId),
    activeProfile ? activeProfile : ({} as IProfile),
    network,
  );

  const { removeMarket, removingMarket } = useRemoveMarketForLsp8Token(
    address,
    parseInt(tokenId),
    activeProfile ? activeProfile : ({} as IProfile),
  );

  const {
    handlePresent: onPresentSellCardModal,
    onDismiss: onDismissSellCardModal,
  } = useModal(
    asset && activeProfile && (
      <SellCardModal
        ownerProfile={activeProfile}
        address={address}
        mint={Number(tokenId)}
        price={marketForTokenId ? marketForTokenId.minimumAmount : undefined}
        marketTokenAddress={
          marketForTokenId ? marketForTokenId.acceptedToken : undefined
        }
        cardImg={asset.lsp8MetaData[tokenId ? tokenId : 0]?.image}
        onDismiss={() => onDismissSellCardModal()}
        whiteListedTokens={asset.whiteListedTokens}
        network={network}
      />
    ),
    'Sell Card Modal',
    'Sell Card',
  );

  const {
    handlePresent: onPresentAuctionModal,
    onDismiss: onDismissAuctionModal,
  } = useModal(
    asset && activeProfile && (
      <AuctionModalContent
        network={network}
        whiteListedTokens={asset.whiteListedTokens}
        onDismiss={() => onDismissAuctionModal()}
        profile={activeProfile}
        assetAddress={address}
        tokenId={Number(tokenId)}
      />
    ),
    'Auction Modal',
    'Auction',
  );

  return (
    <>
      {currentUsersPermissions.call === '0' && marketForTokenId && (
        <>
          <StyledCardPriceValueWrapper>
            <StyledCardPriceValue>
              {marketForTokenId.minimumAmount &&
                marketForTokenId.decimals &&
                displayPrice(
                  marketForTokenId.minimumAmount,
                  marketForTokenId.decimals,
                ).toString()}{' '}
              {marketForTokenId.symbol}
            </StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            {asset && (
              <BuyCardButton
                asset={asset}
                mint={Number(marketForTokenId.tokenId)}
              />
            )}
          </StyledActionsButtonWrapper>
        </>
      )}
      {!marketForTokenId && currentUsersPermissions.call === '1' && (
        <>
          <StyledActionsButtonWrapper>
            <StyledSetPriceButton onClick={onPresentSellCardModal}>
              Set price
            </StyledSetPriceButton>
            <StyledSetForAuctionButton onClick={onPresentAuctionModal}>
              Set for Auction
            </StyledSetForAuctionButton>
          </StyledActionsButtonWrapper>
          <StyledActionsButtonWrapper>
            <StyledSetPriceButton onClick={transferCard}>
              {transferState === STATUS.LOADING
                ? 'Transfering to metamask account…'
                : 'Transfer to metamask account'}
            </StyledSetPriceButton>
          </StyledActionsButtonWrapper>
        </>
      )}
      {marketForTokenId && currentUsersPermissions.call === '1' && (
        <>
          <StyledCardPriceValueWrapper>
            <StyledCardPriceValue>
              {marketForTokenId &&
                displayPrice(
                  marketForTokenId.minimumAmount,
                  marketForTokenId.decimals,
                ).toString()}{' '}
              {marketForTokenId && marketForTokenId.symbol}
            </StyledCardPriceValue>
          </StyledCardPriceValueWrapper>
          <StyledActionsButtonWrapper>
            <StyledChangePriceButton onClick={onPresentSellCardModal}>
              Change price
            </StyledChangePriceButton>
            <StyledWithdrawButton onClick={removeMarket}>
              {removingMarket ? 'Withdrawing from sale…' : 'Withdraw from sale'}
            </StyledWithdrawButton>
          </StyledActionsButtonWrapper>
          <StyledActionsButtonWrapper>
            <StyledSetPriceButton onClick={transferCard}>
              {transferState === STATUS.LOADING
                ? 'Transfering to metamask account…'
                : 'Transfer to metamask account'}
            </StyledSetPriceButton>
          </StyledActionsButtonWrapper>
        </>
      )}
    </>
  );
};
