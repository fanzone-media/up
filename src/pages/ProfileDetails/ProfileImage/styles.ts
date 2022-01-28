import styled from 'styled-components';
import { pulseAnimate } from '../../../features/cards/MetaCard/styles';
import { md } from '../../../utility';

export const StyledProfileImageWrappar = styled.div`
  position: relative;
  display: flex;
  z-index: 0;
  width: 120px;
  height: 120px;

  @media ${md} {
    width: 175px;
    height: 175px;
  }
`;

export const StyledProfileImg = styled.img`
  object-fit: cover;
  object-position: center;
  border-radius: 100%;
  width: 110px;
  margin: auto;

  @media ${md} {
    width: 160px;
  }
`;

export const StyledBlockieImg = styled.img`
  position: absolute;
  z-index: -10;
  width: 100%;
  border-radius: 100%;
`;

export const StyledBlockScoutLogo = styled.img`
  position: absolute;
  width: 35px;
  right: 0;
  bottom: 0;
  animation: ${pulseAnimate} 2s ease-in-out infinite;

  @media ${md} {
    width: 55px;
  }
`;

export const StyledUniversalProfileLogo = styled.img`
  position: absolute;
  width: 30px;
  top: 50%;
  right: -14px;
  margin-top: -15px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;

  @media ${md} {
    right: -20px;
    width: 50px;
    margin-top: -25px;
  }
`;
