import styled from 'styled-components';

export const StyledModalContainer = styled.div`
  position: absolute;
  max-width: 500px;
  width: 100%;
  top: 50%;
  left: 50%;
  right: auto;
  bottom: auto;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  background-color: black;
  border-radius: 20px;
  padding: 10px;
`;

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
