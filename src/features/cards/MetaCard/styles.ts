import styled, { keyframes } from 'styled-components';
import { BgMetaCard } from '../../../assets';

export const pulseAnimate = keyframes`
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
`;

export const StyledCardWrapper = styled.div`
  position: relative;
  width: 165px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;

  @media ${({ theme }) => theme.screen.sm} {
    width: 212px;
  }
`;

export const StyledMediaWrapper = styled.div`
  width: 100%;
  height: 211px;
  display: flex;
  background-image: url(${BgMetaCard});
  background-size: cover;
  background-position: center;
  border-radius: 10px 10px 0 0;

  @media ${({ theme }) => theme.screen.sm} {
    height: 257px;
  }
`;

export const StyledMetaCardImg = styled.img`
  width: 115px;
  height: auto;
  margin: auto;

  @media ${({ theme }) => theme.screen.sm} {
    width: 137px;
    height: auto;
  }
`;

export const StyledCardDetail = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100px;
  background-color: rgba(37, 37, 37, 1);
  border-radius: 0 0 10px 10px;
  padding: 5px 10px 10px 10px;
  row-gap: 5px;
`;

export const StyledCardName = styled.h3`
  font-size: 15px;
  font-weight: ${({ theme }) => theme.font.weight.bolder};

  @media ${({ theme }) => theme.screen.sm} {
    font-size: 18px;
  }
`;

export const StyledCardFullName = styled.p`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 17.5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledBlockScoutIcon = styled.img`
  position: absolute;
  right: 0;
  top: 170px;
  margin-right: 8px;
  height: 40px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;

  @media ${({ theme }) => theme.screen.sm} {
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

  @media ${({ theme }) => theme.screen.sm} {
    top: 205px;
    margin-left: 15px;
    height: 40px;
  }
`;

export const StyledTransferButton = styled.button`
  position: absolute;
  left: 0;
  height: 34px;
  width: 34px;
  top: 170px;
  margin-left: 8px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
  background-color: white;
  border-radius: 100%;

  @media ${({ theme }) => theme.screen.sm} {
    top: 205px;
    margin-left: 15px;
    height: 40px;
    width: 40px;
  }
`;

export const StyledTransferIcon = styled.img`
  margin: 0 auto;
`;
