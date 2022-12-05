import styled from 'styled-components';

export const StyledProcessingWindow = styled.div<{ height?: 'full' }>`
  display: flex;
  position: absolute;
  width: 100%;
  height: ${({ height }) => (height ? '100%' : 'calc(100% - 12em)')};
  bottom: 0;
  left: -0.03em;
  border-radius: 0.625em;
  background-color: rgba(0, 0, 0, 0.8);
`;

export const StyledStateContent = styled.div`
  text-align: center;
  margin: auto;
  display: flex;
  flex-direction: column;
`;

export const StyledStateIcon = styled.img`
  height: 8.5em;
  margin-top: -2em;
`;

export const StyledStateHeading = styled.h2`
  margin-top: -2em;
`;

export const StyledStateDescription = styled.p``;

export const StyledTryButton = styled.button`
  background-color: rgba(255, 129, 1, 1);
  border-radius: 0.2em;
  padding: 0.3em 0;
`;
