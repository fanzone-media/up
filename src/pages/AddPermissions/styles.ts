import styled from 'styled-components';
import { StyledInputRow } from '../ProfileDetails/ProfileEditModal/styles';

export const StyledAddPermissions = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;

  @media ${({ theme }) => theme.screen.md} {
    padding: 0 40px;
  }
`;

export const StyledNetworkLabel = styled.p`
  color: white;
  font-size: 25px;
  font-weight: ${({ theme }) => theme.font.weight.bolder};
`;

export const StyledLabel = styled.p`
  color: white;
  width: 200px;
`;

export const StyledInputWrapper = styled(StyledInputRow)`
  display: flex;
`;

export const StyledInput = styled.input`
  margin: auto 0;
  max-width: 350px;
  width: 100%;
`;

export const StyledCheckboxInput = styled.input`
  margin: auto 10px auto 0;
`;

export const StyledPermissionInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledSetPermisssionButton = styled.button`
  background-color: rgba(33, 33, 33, 1);
  max-width: max-content;
  margin: 20px auto;
  padding: 5px 10px;
  border-radius: 8px;
  color: white;
`;
