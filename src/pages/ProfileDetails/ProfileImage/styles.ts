import styled from 'styled-components';
import { pulseAnimate } from '../../../features/cards/MetaCard/styles';

export const StyledProfileImageWrapper = styled.div`
  position: relative;
  display: flex;
  z-index: 0;
`;

export const StyledProfileImg = styled.img`
  border-radius: 50%;
  height: calc(100% - 1em);
  inset: 0;
  margin: auto;
  position: absolute;
  width: calc(100% - 1em);
`;

export const StyledBlockieImg = styled.img`
  align-items: center;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const StyledBlockScoutLogo = styled.img`
  position: absolute;
  width: 35px;
  right: 0;
  bottom: 0;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
  z-index: 10;

  @media ${({ theme }) => theme.screen.md} {
    width: 55px;
  }
`;

export const StyledUniversalProfileLogo = styled.img`
  height: calc(100% - 1em);
  inset: 0;
  position: absolute;
  width: auto;
`;
