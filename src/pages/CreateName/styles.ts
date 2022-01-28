import styled from 'styled-components';

export const StyledCreateName = styled.div`
  display: flex;
  width: 100%;
`;

export const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto 0 auto;
`;

export const StyledInput = styled.input`
  background-color: rgba();
`;

export const StyledCheckAvailabilityButton = styled.button`
  background-color: rgba(255, 155, 0, 1);
  color: white;
  border-radius: 3px;
  margin: 10px 0 10px 0;
`;

export const StyledConfirmButton = styled(StyledCheckAvailabilityButton)``;

export const StyledError = styled.p`
  color: red;
`;
