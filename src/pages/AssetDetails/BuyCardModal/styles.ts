import styled from 'styled-components';

export const StyledBuyCardModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const StyledModalHeader = styled.h3`
  text-align: center;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: 1.2rem;
`;

export const StyledInfoText = styled.p`
  font-size: 1rem;
`;

export const StyledPaymentText = styled.p`
  font-size: 0.9em;
  font-weight: 700;
`;

export const StyledRadioGroup = styled.div`
  display: flex;
  column-gap: 0.2em;
`;

export const StyledRadioInput = styled.input`
  margin: auto 0;
  position: relative;
  visibility: hidden;
`;

export const StyledRadioLabel = styled.label<{ $checked: boolean }>`
  background-color: ${({ $checked }) =>
    $checked ? 'rgba(255, 129, 1, 1)' : 'rgba(83, 83, 83, 1)'};
  height: 3em;
  width: 100%;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 0.3em;
  line-height: 3em;
  text-align: center;

  input[type='radio']::after {
    width: 1em;
    height: 1em;
    border-radius: 15px;
    left: -1px;
    position: absolute;
    background-color: transparent;
    content: '';
    display: inline-block;
    visibility: visible;
    border: 0.15em solid white;
  }

  input[type='radio']:checked::after {
    width: 1em;
    height: 1em;
    border-radius: 15px;
    left: -1px;
    position: absolute;
    content: '';
    display: inline-block;
    visibility: visible;
    border: 0.15em solid;
    background: radial-gradient(
      white 0%,
      white 40%,
      transparent 50%,
      transparent
    );
    border-color: white;
  }
`;

export const StyledSelectInputContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
`;

export const StyledUpAddressSelectInput = styled.select`
  background: transparent;
  color: white;
  border: 1px solid rgba(153, 153, 153, 1);
  border-radius: 0.3em;
  padding: 0.5em 0.5em;
  text-align: end;
  width: 100%;
`;

export const StyledUpAddressSelectLabel = styled.p`
  position: absolute;
  padding: 0 0.5em;
  margin: -0.75em 0 0 0.5em;
  background-color: rgba(49, 49, 49, 1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

export const StyledBuyStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 2em;
  margin-top: 1.5em;
  position: relative;
`;

export const StyledBuyStep = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 0.5em;
`;

export const StyledErrorMessage = styled.p`
  color: red;
`;
