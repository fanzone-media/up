import { useMemo } from 'react';
import { useModal } from '../../../../hooks/useModal';
import { useUrlParams } from '../../../../hooks/useUrlParams';
import { ICard } from '../../../../services/models';
import { BuyCardModal } from '../../BuyCardModal';
import { StyledCardBuyButton } from './styles';

interface IProps {
  asset: ICard;
  mint: number;
}

export const BuyCardButton = ({ asset, mint }: IProps) => {
  const { network, tokenId } = useUrlParams();

  const selectedMintMarket = useMemo(() => {
    const market = asset.markets.find((item) => Number(item.tokenId) === mint);
    const token =
      market &&
      asset &&
      asset.whiteListedTokens.find(
        (i) => i.tokenAddress === market.acceptedToken,
      );
    return (
      market && {
        ...market,
        decimals: token && token.decimals,
        symbol: token && token.symbol,
      }
    );
  }, [asset, mint]);

  const {
    handlePresent: onPresentBuyCardModal,
    onDismiss: onDismissBuyCardModal,
  } = useModal(
    asset && selectedMintMarket && (
      <BuyCardModal
        address={asset.address}
        mint={Number(selectedMintMarket.tokenId)}
        price={selectedMintMarket.minimumAmount}
        tokenAddress={selectedMintMarket.acceptedToken}
        whiteListedTokens={asset.whiteListedTokens}
        cardImg={asset.ls8MetaData[tokenId ? tokenId : 0]?.image}
        onClose={() => {
          onDismissBuyCardModal();
        }}
        network={network}
      />
    ),
    'Buy Card Modal',
    'Buy Card',
  );

  return (
    <StyledCardBuyButton onClick={onPresentBuyCardModal}>
      {' '}
      Buy{' '}
    </StyledCardBuyButton>
  );
};
