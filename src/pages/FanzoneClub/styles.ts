import styled from 'styled-components';

export const StyledFanzoneClubPage = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const StyledFanzoneClubFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 30px;
  row-gap: 20px;
  background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.08) 107.79%
    ),
    rgba(33, 33, 33, 0.6);

  @media ${({ theme }) => theme.screen.xs} {
    max-width: 500px;
    margin: 20px auto 0 auto;
    border-radius: 20px;
  }
`;

export const StyledFanzoneClubCardsImg = styled.img`
  width: 100%;
  margin: 0 auto;

  @media ${({ theme }) => theme.screen.xs} {
    border-radius: 20px 20px 0 0;
  }
`;

export const StyledBalanceLabel = styled.p`
  color: white;
  margin: 0 auto;
  font-size: 18px;
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
  opacity: ${(props) => props.disabled && 0.4};
`;

export const StyledErrorMessage = styled.p`
  color: red;
  margin: 0 auto;
  text-align: center;
`;

export const StyledTransactionResponseWrapper = styled.div`
  display: flex;
`;

export const StyledBackToBuyButton = styled.button`
  text-decoration: underline;
  color: white;
  margin-right: auto;
  margin-left: 10px;
`;

export const StyledWelcomeTest = styled.h3`
  font-size: 28px;
  color: white;
  text-align: center;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

export const StyledOpenSeaLink = styled.a`
  margin: 0 auto;
  color: white;
  text-decoration: underline;
`;

export const StyledPolygonScanLink = styled(StyledOpenSeaLink)``;
