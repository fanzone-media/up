import { useMemo } from 'react';
import { IMarket, IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import {
  StyledListMint,
  StyledListPrice,
  StyledSelectMintList,
  StyledSelectMintListContent,
  StyledSelectMintListHeader,
  StyledSelectMintListHeaderContent,
  StyledSelectMintModalContent,
} from './styles';

interface IProps {
  ownedTokenIds: number[];
  markets: IMarket[];
  whiteListedTokens: IWhiteListedTokens[];
  onSelect: (index: number) => void;
  onSelectCallback: () => void;
}

export const SelectMintModalContent = ({
  ownedTokenIds,
  markets,
  whiteListedTokens,
  onSelect,
  onSelectCallback,
}: IProps) => {
  const renderMintList = useMemo(
    () =>
      ownedTokenIds.map((id) => {
        const market = markets.find((item) => Number(item.tokenId) === id);
        const token =
          market &&
          whiteListedTokens.find(
            (i) => i.tokenAddress === market.acceptedToken,
          );
        return (
          <StyledSelectMintListContent
            onClick={() => {
              onSelect(ownedTokenIds.indexOf(id) + 1);
              onSelectCallback();
            }}
          >
            <StyledListMint>{id}</StyledListMint>
            <StyledListPrice>
              {market && token
                ? `${displayPrice(
                    market?.minimumAmount.toString(),
                    token?.decimals,
                  )} ${token.symbol}`
                : '-'}
            </StyledListPrice>
          </StyledSelectMintListContent>
        );
      }),
    [markets, onSelect, onSelectCallback, ownedTokenIds, whiteListedTokens],
  );

  return (
    <StyledSelectMintModalContent>
      <StyledSelectMintListHeader>
        <StyledSelectMintListHeaderContent>
          Mint
        </StyledSelectMintListHeaderContent>
        <StyledSelectMintListHeaderContent>
          Price
        </StyledSelectMintListHeaderContent>
      </StyledSelectMintListHeader>
      <StyledSelectMintList>{renderMintList}</StyledSelectMintList>
    </StyledSelectMintModalContent>
  );
};
