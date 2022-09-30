import styled from 'styled-components';

export const StyledEditProfileModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledInputRow = styled.div`
  column-gap: 1.5em;
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 25px 0 0 0;
  align-items: flex-end;
`;

export const StyledInput = styled.input`
  background: transparent;
  color: white;
  border: 1px solid rgba(153, 153, 153, 1);
  border-radius: 0.3em;
  margin-left: 0.5em;
  padding: 0.5em 0.5em;
  width: 100%;
`;

export const StyledLabel = styled.label`
  color: #fff;
`;

export const StyledTextAreaInput = styled.textarea`
  background: transparent;
  color: white;
  border: 1px solid rgba(153, 153, 153, 1);
  border-radius: 0.3em;
  margin-left: 0.5em;
  padding: 0.5em 0.5em;
  width: 100%;
  resize: vertical;
`;

export const StyledSaveButton = styled.button`
  color: #fff;
  background: linear-gradient(180deg, #ff9b00 0%, #ff5c00 100%);
  font-size: 0.9375rem;
  padding: 0.75em;
  width: 100%;
`;

export const StyledLoadingMessage = styled.p``;

export const StyledErrorText = styled.p`
  color: red;
  text-align: center;
`;

export const StyledErrorLoadingContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MetaLabeledInput = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const MetaLabel = styled.span`
  font-size: 14px;
  color: rgba(153, 153, 153, 1);
`;

export const FileEditWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const PreviewImage = styled.img`
  max-width: 5em;
  height: auto;
  border-radius: 0.3em;
  margin-bottom: 0.5em;
`;

export const ImageWrapper = styled.div`
  text-align: center;
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 5px;
`;

export const ProfileName = styled.p`
  padding: 1px 2px;
  border: 1px solid #ffffff80;
  border-radius: 5px;
`;

export const ProfileError = styled.p`
  color: #cc0000;
`;

export const StyledErrorIcon = styled.img`
  height: 50px;
  width: 50px;
  color: red;
  margin: 0 auto 10px;
`;
