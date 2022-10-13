import styled from 'styled-components';

export const StyledModalContainer = styled.div``;

export const StyledModalHeader = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
`;

export const StyledModalHeading = styled.h2`
  font-size: 20px;
`;

export const StyledCloseModalButton = styled.button`
  margin-left: auto;
`;

export const StyledModalWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: fixed;
  z-index: 1000;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const StyledModalBackdrop = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const StyledModalBoxWrapper = styled.div`
  position: relative;
  border: 1px solid #aaaaaa;
  border-radius: 0.625em;
  background-color: #313131;
  padding: 1.5em 1.25em;
  max-width: 35em;
  width: 100%;
  z-index: 10;
  box-sizing: border-box;

  @media ${({ theme }) => theme.screen.md} {
    max-width: auto;
    min-width: 30em;
  }
`;

export const StyledModalBoxInner = styled.div`
  color: #fff;
`;

export const StyledModalBoxTitle = styled.h2`
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin-bottom: 2em;
  text-align: center;
  text-transform: uppercase;
`;

export const StyledModalButtonsWrapper = styled.div`
  display: flex;
  column-gap: 0.5em;
`;

export const StyledModalButton = styled.button<{ variant?: 'gray' | 'orange' }>`
  background-color: ${({ variant }) =>
    variant === 'gray' ? '#4C4C4C' : '#FF8101'};
  border-radius: 0.2em;
  color: white;
  width: 100%;
  padding: 0.5em 0;
  margin-top: 0.9em;
`;
