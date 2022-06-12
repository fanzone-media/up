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
  border: 1px solid #aaa;
  border-radius: 0.625em;
  background-color: #313131;
  padding: 1.5em 1.25em;
  min-width: 35em;
  z-index: 10;
`;

export const StyledModalBoxInner = styled.div`
  color: #fff;
`;

export const StyledModalBoxTitle = styled.h2`
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-bottom: 2em;
  text-align: center;
  text-transform: uppercase;
`;

export const StyledModalButtonsWrapper = styled.div<{ topMargin?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-top: ${({ topMargin }) => (topMargin ? '2.5em' : '0.75em')};
`;

export const StyledModalButton = styled.button<{ variant?: 'gray' | 'orange' }>`
  color: #fff;
  background-color: ${({ variant }) =>
    variant === 'gray' ? '#4C4C4C' : '#FF8101'};
  font-size: 0.9375rem;
  padding: 0.75em;
  width: 100%;
`;
