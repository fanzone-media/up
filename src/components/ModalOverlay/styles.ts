import styled from 'styled-components';

export const StyledModalOverlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  z-index: 9999;
`;

export const StyledModal = styled.div`
  position: relative;
  border-radius: 10px;
  background-color: rgba(49, 49, 49, 1);
  margin: auto;
`;

export const StyledCloseModalButton = styled.button`
  position: absolute;
  right: 0;
  margin: 10px 10px 0 0;
`;

export const StyledCloseButtonIcon = styled.img``;
