import {
  StyledSelectMintList,
  StyledSelectMintListContent,
  StyledSelectMintListHeader,
  StyledSelectMintListHeaderContent,
  StyledSelectMintModalContent,
} from './styles';

interface IProps {
  ownedTokenIds: number[];
  onSelect: (index: number) => void;
  onSelectCallback: () => void;
}

export const SelectMintModalContent = ({
  ownedTokenIds,
  onSelect,
  onSelectCallback,
}: IProps) => {
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
      <StyledSelectMintList>
        {ownedTokenIds.map((id) => (
          <StyledSelectMintListContent
            onClick={() => {
              onSelect(id);
              onSelectCallback();
            }}
          >
            {id}
          </StyledSelectMintListContent>
        ))}
      </StyledSelectMintList>
    </StyledSelectMintModalContent>
  );
};
