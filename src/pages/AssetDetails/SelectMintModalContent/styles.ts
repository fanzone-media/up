import styled from 'styled-components';

export const StyledSelectMintModalContent = styled.div`
  max-height: 40em;
  display: flex;
  flex-direction: column;
`;

export const StyledSelectMintListHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5em;
  border-radius: 0.5em;
  margin-bottom: 1.5em;
`;

export const StyledSelectMintListHeaderContent = styled.h4``;

export const StyledSelectMintList = styled.div`
  overflow-y: scroll;
`;

export const StyledSelectMintListContent = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 1em;
  cursor: pointer;

  &:nth-child(even) {
    border-radius: 0.5em;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 45.66%,
      rgba(255, 255, 255, 0) 97.77%
    );
  }
`;
