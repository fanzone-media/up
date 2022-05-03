import styled from 'styled-components';

export const StyledEditProfileModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledInputRow = styled.div`
  column-gap: 5em;
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 25px 0 0 0;
`;

export const StyledInput = styled.input.attrs({
  placeholder: '0x',
})`
  color: black;
  min-width: 25rem;
  text-align: right;
  width: auto;
`;

export const StyledLabel = styled.label`
  color: #fff;
`;

export const StyledTextAreaInput = styled.textarea`
  min-height: 100px;
  color: black;
`;

export const StyledSaveButton = styled.button`
  margin: 25px auto 0 auto;
  width: max-content;
  padding: 1px 3px 1px 3px;
  background-color: white;
  color: black;
  border-radius: 5px;
`;

export const StyledLoadingMessage = styled.p``;

export const StyledErrorText = styled.p``;

export const StyledErrorLoadingContent = styled.div`
  display: flex;
  flex-direction: column;
`;
