import { useFetchAsset } from '../../../hooks/useFetchAsset';
import { useFetchMarkets } from '../../../hooks/useFetchMarkets';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { STATUS } from '../../../utility';
import { CardMarket } from '../../AssetDetails/CardMarket';
import { ConnectToMetaMaskButton } from '../components/ConnectToMetaMaskButton';
import {
  StyledColorSpan,
  StyledEmbedMarketContent,
  StyledEmbedMarketWrapper,
  StyledMessageLabel,
  StyledReloadMarketButton,
} from './styles';

export const EmbedMarket = () => {
  const { address } = useUrlParams();
  const { asset, status: assetStatus } = useFetchAsset(address);
  const { status: marketStatus } = useFetchMarkets(address);

  return (
    <StyledEmbedMarketContent>
      <ConnectToMetaMaskButton />
      <StyledReloadMarketButton onClick={() => window.location.reload()}>
        Reload Market
      </StyledReloadMarketButton>
      <StyledEmbedMarketWrapper>
        {(assetStatus === STATUS.LOADING ||
          marketStatus === STATUS.LOADING) && (
          <StyledMessageLabel>
            The market is currently{' '}
            <StyledColorSpan>being loaded . . .</StyledColorSpan>
          </StyledMessageLabel>
        )}
        {asset &&
          assetStatus === STATUS.SUCCESSFUL &&
          marketStatus !== STATUS.LOADING && (
            <CardMarket
              asset={asset}
              cardMarkets={asset?.market}
              whiteListedTokens={asset?.whiteListedTokens}
            />
          )}
        {assetStatus === STATUS.FAILED && (
          <StyledMessageLabel>Card not found</StyledMessageLabel>
        )}
      </StyledEmbedMarketWrapper>
    </StyledEmbedMarketContent>
  );
};
