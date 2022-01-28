import styled, { keyframes } from 'styled-components';
import { BgMetaCard } from '../../../assets';
import { sm } from '../../../utility';

export const pulseAnimate = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
`;

export const StyledCardWrappar = styled.div`
  position: relative;
  width: 165px;
  height: 100%;

  @media ${sm} {
    width: 212px;
  }
`;

export const StyledMediaWrappar = styled.div`
  width: 100%;
  height: 211px;
  display: flex;
  background-image: url(${BgMetaCard});
  background-size: cover;
  background-position: center;
  border-radius: 10px 10px 0 0;

  @media ${sm} {
    height: 257px;
  }
`;

export const StyledMetaCardImg = styled.img`
  width: 115px;
  height: 171px;
  margin: auto;

  @media ${sm} {
    width: 137px;
    height: 203px;
  }
`;

export const StyledCardDetail = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 211px);
  background-color: #212121;
  border-radius: 0 0 10px 10px;
  padding: 5px 10px 10px 10px;
  row-gap: 5px;

  @media ${sm} {
    height: calc(100% - 257px);
  }
`;

export const StyledCardName = styled.h3`
  font-size: 15px;
  font-weight: 700;

  @media ${sm} {
    font-size: 18px;
  }
`;

export const StyledCardFullName = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 17.5px;
`;

export const StyledBlockScoutIcon = styled.img`
  position: absolute;
  right: 0;
  top: 170px;
  margin-right: 8px;
  height: 40px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;

  @media ${sm} {
    top: 205px;
    height: 45px;
    margin-right: 15px;
  }
`;

export const StyledUniversalProfileIcon = styled.img`
  position: absolute;
  left: 0;
  height: 34px;
  top: 170px;
  margin-left: 8px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;

  @media ${sm} {
    top: 205px;
    margin-left: 15px;
    height: 40px;
  }
`;

export const StyledOwnedMint = styled.p`
  font-size: 14px;
  margin: auto auto 0 auto;
`;
