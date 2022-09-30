import styled from 'styled-components';

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
