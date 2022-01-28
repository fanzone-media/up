import styled from 'styled-components';
import { BgMetaCard } from '../../assets';
import { pulseAnimate } from '../../features/cards/MetaCard/styles';
import { lg, md, sm, xl } from '../../utility';

export const StyledAssetDetailsContentWrappar = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
`;

export const StyledAssetDetailContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  @media ${md} {
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
    padding-top: 48px;
  }

  @media ${xl} {
    padding: 48px 40px 0 40px;
  }
`;

export const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  @media ${sm} {
    margin: 0 48px 0 48px;
  }

  @media ${lg} {
    grid-template-columns: repeat(2, 392px);
    margin: 0 auto 0 auto;
    column-gap: 20px;
  }

  @media ${xl} {
    grid-template-columns: 2fr 1fr;
    column-gap: 10px;
    margin: 0;
  }
`;

export const StyledAssetDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 20px;

  @media ${xl} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StyledMediaWrappar = styled.div`
  position: relative;
  background: url(${BgMetaCard});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  height: 473px;

  @media ${sm} {
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
  }
`;

export const StyledMetaCardImg = styled.img`
  width: 221px;
  margin: auto;
`;

export const StyledStatsName = styled.h1`
  position: absolute;
  left: 5%;
  margin-top: 10px;
  font-size: 24px;
  font-weight: 700;
`;

export const StyledUniversalProfileIcon = styled.img`
  position: absolute;
  width: 44px;
  height: 44px;
  bottom: 5%;
  left: 10%;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
`;

export const StyledBlockScoutIcon = styled.img`
  position: absolute;
  width: 44px;
  height: 44px;
  bottom: 5%;
  right: 10%;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
`;

export const StyledDetailsWrappar = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0px 0px 0px;

  @media ${sm} {
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.08) 100%
      ),
      #212121;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
    height: 473px;
  }
`;

export const StyledCardInfoLabel = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 8px 10px 8px;
  border-width: 0 0 1px 0;
  border-style: solid;
  border-color: white;
  padding-bottom: 5px;

  @media ${sm} {
    margin: 0 20px 5px 20px;
  }
`;

export const StyledInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 35% 1fr;
  padding: 0 8px 5px 8px;
  row-gap: 10px;

  @media ${sm} {
    padding: 0 20px 0 20px;
  }
`;

export const StyledLabel = styled.p`
  font-size: 15px;
`;

export const StyledValue = styled.p`
  font-size: 15px;
  font-weight: 700;
  text-transform: capitalize;
`;

export const StyledFullName = styled.p`
  font-size: 15px;
  font-weight: 700;
  margin: 0 10px 0 10px;
  padding: 15px 0 15px 0;
  border-width: 2px 0 2px 0;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.25);
  line-height: 17px;

  @media ${sm} {
    margin: 0;
    padding: 15px 20px 15px 20px;
    border-width: 2px 0 0 0;
    margin-top: auto;
  }
`;

export const StyledExtraInfo = styled.div`
  display: flex;
  flex-direction: column;
  height: max-content;
  padding: 0 8px 0 8px;
  margin-top: 20px;

  @media ${sm} {
    padding: 0;
  }

  @media ${lg} {
    margin: 0;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.08) 100%
      ),
      #212121;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
    padding: 15px 10px 15px 10px;
  }
`;

export const StyledIssuerLabel = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;

  @media ${lg} {
    width: 116px;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: rgba(223, 223, 223, 1);
  }
`;

export const StyledCreatorLabel = styled(StyledIssuerLabel)`
  margin-top: 10px;
`;

export const StyledHolderLabel = styled(StyledIssuerLabel)`
  margin-top: 10px;
  margin-left: 8px;
  border: none;

  @media ${sm} {
    margin-left: 48px;
  }

  @media ${xl} {
    margin: 0;
  }
`;

export const StyledIssuerWrappar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  column-gap: 5px;
  row-gap: 10px;
  /* 
    @media ${sm} {
        grid-template-columns: repeat(3, 1fr);
    } */

  @media ${md} {
    grid-template-columns: repeat(4, 1fr);
  }

  @media ${lg} {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StyledCreatorWrappar = styled(StyledIssuerWrappar)``;

export const StyledHolderWrappar = styled(StyledIssuerWrappar)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 8px 0 8px;
  justify-items: center;

  @media ${sm} {
    margin: 0 48px 0 48px;
  }

  @media ${md} {
    grid-template-columns: repeat(4, 1fr);
  }

  @media ${lg} {
    grid-template-columns: repeat(5, 1fr);
  }

  @media ${xl} {
    margin: 0;
    grid-template-columns: repeat(6, 1fr);
  }
`;
