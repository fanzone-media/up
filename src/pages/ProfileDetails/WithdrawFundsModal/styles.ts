import styled from 'styled-components';

export const StyledWithdrawModalContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledRadioLabel = styled.label<{ $checked: boolean }>`
  background-color: ${({ $checked }) =>
    $checked ? 'rgba(255, 129, 1, 1)' : 'rgba(83, 83, 83, 1)'};
  height: 3em;
  width: 100%;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 0.3em;
  line-height: 3em;
  padding: 0 0.9em;
  display: flex;

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

export const StyledRadioInput = styled.input`
  margin: auto 0;
  top: -0.1em;
  position: relative;
  visibility: hidden;
`;

export const StyledTokenLabel = styled.p`
  margin-left: 0.9em;
`;

export const StyledBalanceWrapper = styled.div`
  display: flex;
  border-left: 1px solid white;
  width: 50%;
  margin-left: auto;
  padding-left: 0.9em;
`;

export const StyledBalanceLabel = styled.p``;

export const StyledBalanceValue = styled.p`
  margin-left: auto;
`;
