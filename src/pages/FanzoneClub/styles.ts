import styled from 'styled-components';

export const StyledFanzoneClubPage = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  row-gap: 20px;
`;

export const StyledFanzoneClubCardsImg = styled.img`
  max-height: 300px;
  margin: 0 auto;
`;

export const StyledInputWrapper = styled.div`
  display: flex;
  margin: 0 auto;
  column-gap: 20px;
`;

export const StyledInputLabel = styled.label`
  color: white;
  margin: auto 0;
`;

export const StyledInput = styled.input`
  padding: 5px 10px;
  border-radius: 5px;
  background: rgba(225, 225, 225, 0.2);
  color: white;
`;

export const StyledBuyClubCardButton = styled.button`
  border-radius: 5px;
  background: rgba(255, 129, 1, 1);
  padding: 5px 10px;
  margin: 0 auto;
  color: white;
`;

export const StyledErrorMessage = styled.p`
  color: red;
  margin: 0 auto;
`;
