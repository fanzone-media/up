import styled from 'styled-components';

export const StyledModalOverlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.6);
`;

export const StyledModal = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 10px;
  background-color: rgba(49, 49, 49, 1);
  border: 1px solid rgba(170, 170, 170, 1);
  margin: auto;
  padding: 1.5em 1em;
  width: 100%;
  max-width: 25em;
`;

export const StyledCloseModalButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  margin: 1em 1em 0 0;
`;

export const StyledCloseButtonIcon = styled.img``;
