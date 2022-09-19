import styled from 'styled-components';

export const StyledShareReferModalContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1em;
`;

export const StyledShareMessage = styled.p``;

export const StyledSeparatorContainer = styled.div`
  display: flex;
  width: 100%;
  column-gap: 0.5em;
`;

export const StyledDivider = styled.span`
  border: 0.01em solid rgba(153, 153, 153, 1);
  margin: auto 0;
  width: 100%;
`;

export const StyledDivText = styled.p``;

export const StyledShareViaLabel = styled.p``;

export const StyledShareOptionsContainer = styled.div`
  display: flex;
  column-gap: 1.5em;
`;

export const StyledShareLink = styled.a.attrs({
  target: '_blank',
})`
  display: flex;
  align-items: center;
  column-gap: 0.25em;
`;

export const StyledInputError = styled.p`
  color: red;
`;
