import { Puff } from 'react-loader-spinner';
import styled from 'styled-components';
import { BgMetaCard } from '../../assets';
import { Accordion } from '../../components';
import { pulseAnimate } from '../../features/cards/MetaCard/styles';

export const StyledAssetDetailsContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
`;

export const StyledCardError = styled.h1`
  font-size: 30px;
  margin: 60px auto 0 auto;
`;

export const StyledLoadingHolder = styled.div`
  margin: auto;
`;

export const StyledLoader = styled(Puff)`
  margin: 0 auto 0 auto;
  height: 400px;
`;

export const StyledAssetDetailContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 5px;

  @media ${({ theme }) => theme.screen.md} {
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
    padding: 48px 40px 0 40px;
    row-gap: 30px;
  }

  @media ${({ theme }) => theme.screen.xl} {
    padding: 48px 40px 0 40px;
  }
`;

// export const StyledGrid = styled.div`
//   display: grid;
//   grid-template-columns: 1fr;

//   @media ${({theme}) => theme.screen.sm} {
//     margin: 0 48px 0 48px;
//   }

//   @media ${({theme}) => theme.screen.lg} {
//     grid-template-columns: repeat(2, 392px);
//     margin: 0 auto 0 auto;
//     column-gap: 20px;
//   }

//   @media ${({theme}) => theme.screen.xl} {
//     grid-template-columns: 2fr 1fr;
//     column-gap: 10px;
//     margin: 0;
//   }
// `;

// export const StyledAssetDetailGrid = styled.div`
//   display: grid;
//   grid-template-columns: 1fr;
//   column-gap: 10px;
//   row-gap: 20px;

//   @media ${({theme}) => theme.screen.xl} {
//     grid-template-columns: repeat(2, 1fr);
//   }
// `;

// export const StyledMediaWrapper = styled.div`
//   position: relative;
//   background: url(${BgMetaCard});
//   background-position: center;
//   background-repeat: no-repeat;
//   background-size: cover;
//   display: flex;
//   height: 473px;

//   @media ${({theme}) => theme.screen.sm} {
//     border-radius: 10px;
//     border: 1px solid rgba(255, 255, 255, 0.15);
//     box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
//   }
// `;

// export const StyledMetaCardImg = styled.img`
//   width: 221px;
//   margin: auto;
// `;

// export const StyledStatsName = styled.h1`
//   position: absolute;
//   left: 5%;
//   margin-top: 10px;
//   font-size: 24px;
//   font-weight: ${({theme}) => theme.font.weight.bold};
// `;

// export const StyledUniversalProfileIcon = styled.img`
//   position: absolute;
//   width: 44px;
//   height: 44px;
//   bottom: 5%;
//   left: 10%;
//   animation: ${pulseAnimate} 2s ease-in-out infinite;
// `;

export const StyledExplorerIcon = styled.img`
  position: absolute;
  width: 44px;
  height: 44px;
  bottom: 0;
  left: 0;
  margin: 0 0 20px 20px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
`;

// export const StyledDetailsWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   padding: 10px 0px 0px 0px;

//   @media ${({theme}) => theme.screen.sm} {
//     background: linear-gradient(
//         180deg,
//         rgba(255, 255, 255, 0) 0%,
//         rgba(255, 255, 255, 0.08) 100%
//       ),
//       #212121;
//     border-radius: 10px;
//     border: 1px solid rgba(255, 255, 255, 0.15);
//     box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
//     min-height: 473px;
//   }
// `;

// export const StyledCardInfoLabel = styled.h2`
//   font-size: 18px;
//   font-weight: ${({theme}) => theme.font.weight.bold};
//   margin: 0 8px 10px 8px;
//   border-width: 0 0 1px 0;
//   border-style: solid;
//   border-color: white;
//   padding-bottom: 5px;

//   @media ${({theme}) => theme.screen.sm} {
//     margin: 0 20px 5px 20px;
//   }
// `;

// export const StyledInfoGrid = styled.div`
//   display: grid;
//   grid-template-columns: 35% 1fr;
//   padding: 0 8px 5px 8px;
//   row-gap: 10px;

//   @media ${({theme}) => theme.screen.sm} {
//     padding: 0 20px 0 20px;
//   }
// `;

export const StyledLabel = styled.p`
  font-size: 15px;
`;

// export const StyledValue = styled.p`
//   font-size: 15px;
//   font-weight: ${({theme}) => theme.font.weight.bold};
//   text-transform: capitalize;
// `;

// export const StyledFullName = styled.p`
//   font-size: 15px;
//   font-weight: ${({theme}) => theme.font.weight.bold};
//   margin: 0 10px 0 10px;
//   padding: 15px 0 15px 0;
//   border-width: 2px 0 2px 0;
//   border-style: solid;
//   border-color: rgba(255, 255, 255, 0.25);
//   line-height: 17px;

//   @media ${({theme}) => theme.screen.sm} {
//     margin: 0;
//     padding: 15px 20px 15px 20px;
//     border-width: 2px 0 0 0;
//     margin-top: auto;
//   }
// `;

// export const StyledExtraInfo = styled.div`
//   display: flex;
//   flex-direction: column;
//   height: max-content;
//   padding: 0 8px 0 8px;
//   margin-top: 20px;

//   @media ${({theme}) => theme.screen.sm} {
//     padding: 0;
//   }

//   @media ${({theme}) => theme.screen.lg} {
//     margin: 0;
//     background: linear-gradient(
//         180deg,
//         rgba(255, 255, 255, 0) 0%,
//         rgba(255, 255, 255, 0.08) 100%
//       ),
//       #212121;
//     border-radius: 10px;
//     border: 1px solid rgba(255, 255, 255, 0.15);
//     box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.25);
//     padding: 15px 10px 15px 10px;
//   }
// `;

// export const StyledIssuerLabel = styled.h3`
//   font-size: 18px;
//   font-weight: ${({theme}) => theme.font.weight.bold};
//   margin-bottom: 10px;

//   @media ${({theme}) => theme.screen.lg} {
//     width: 116px;
//     border-width: 0 0 1px 0;
//     border-style: solid;
//     border-color: rgba(223, 223, 223, 1);
//   }
// `;

// export const StyledCreatorLabel = styled(StyledIssuerLabel)`
//   margin-top: 10px;
// `;

// export const StyledHolderLabel = styled(StyledIssuerLabel)`
//   margin-top: 10px;
//   margin-left: 8px;
//   border: none;

//   @media ${({theme}) => theme.screen.sm} {
//     margin-left: 48px;
//   }

//   @media ${({theme}) => theme.screen.xl} {
//     margin: 0;
//   }
// `;

// export const StyledIssuerWrapper = styled.div`
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   justify-items: center;
//   column-gap: 5px;
//   row-gap: 10px;
//   /*
//     @media ${({theme}) => theme.screen.sm} {
//         grid-template-columns: repeat(3, 1fr);
//     } */

//   @media ${({theme}) => theme.screen.md} {
//     grid-template-columns: repeat(4, 1fr);
//   }

//   @media ${({theme}) => theme.screen.lg} {
//     grid-template-columns: repeat(3, 1fr);
//   }
// `;

// export const StyledCreatorWrapper = styled(StyledIssuerWrapper)``;

// export const StyledHolderWrapper = styled(StyledIssuerWrapper)`
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   margin: 0 8px 0 8px;
//   justify-items: center;

//   @media ${({theme}) => theme.screen.sm} {
//     margin: 0 48px 0 48px;
//   }

//   @media ${({theme}) => theme.screen.md} {
//     grid-template-columns: repeat(4, 1fr);
//   }

//   @media ${({theme}) => theme.screen.lg} {
//     grid-template-columns: repeat(5, 1fr);
//   }

//   @media ${({theme}) => theme.screen.xl} {
//     margin: 0;
//     grid-template-columns: repeat(6, 1fr);
//   }
// `;

// Re designed styled components

export const StyledCardMainDetails = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    flex-direction: row;
    column-gap: 20px;
    height: 590px;
  }
`;

export const StyledMediaWrapper = styled.div`
  position: relative;
  display: flex;
  background: url(${BgMetaCard});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 445px;

  @media ${({ theme }) => theme.screen.md} {
    width: 50%;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    height: 100%;
  }
`;

export const StyledMedia = styled.img`
  width: 230px;
  margin: auto;
`;

export const StyledMintControls = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: max-content;
  display: flex;
  column-gap: 20px;
  margin: 0 20px 20px 0;
`;

export const StyledMintSkipButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border-radius: 100%;
  height: 40px;
  width: 40px;
  display: flex;
`;

export const StyledMintSkipButtonImg = styled.img`
  margin: auto;
`;

export const StyledMintSliderIndex = styled.p`
  margin: auto 0;
`;

export const StyledCardInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    width: 50%;
    row-gap: 20px;
  }
`;

export const StyledCardPriceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  row-gap: 10px;

  @media ${({ theme }) => theme.screen.md} {
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.08) 98.49%
      ),
      rgba(33, 33, 33, 0.6);
  }
`;

export const StyledCardPriceWrapperHeader = styled.div`
  display: flex;
`;

export const StyledCardPriceLabel = styled.p``;

export const StyledQuickActions = styled.div`
  display: grid;
  width: 110px;
  height: 30px;
  grid-template-columns: repeat(3, 1fr);
  margin-left: auto;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
`;

export const StyledReloadPriceAction = styled.button`
  display: flex;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
`;

export const StyledShareCardAction = styled(StyledReloadPriceAction)``;

export const StyledOptionAction = styled(StyledReloadPriceAction)`
  border-right: none;
`;

export const StyledActionIcon = styled.img`
  margin: auto;
`;

export const StyledCardPriceValueWrapper = styled.div`
  display: flex;
`;

export const StyledTokenIcon = styled.img``;

export const StyledCardPriceValue = styled.p`
  margin: auto 0;
`;

export const StyledActionsButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;

  @media ${({ theme }) => theme.screen.md} {
    flex-direction: row;
    column-gap: 10px;
  }
`;

export const StyledBuyButton = styled.button`
  width: 100%;
  background: rgba(255, 129, 1, 1);
  border-radius: 5px;
  padding: 7px 0;
`;

export const StyledSetPriceButton = styled(StyledBuyButton)`
  background: rgba(255, 255, 255, 0.2);
`;

export const StyledChangePriceButton = styled(StyledSetPriceButton)``;

export const StyledWithdrawButton = styled(StyledSetPriceButton)``;

export const StyledCardInfoAccordion = styled(Accordion)``;

export const StyledCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const StyledCardInfoContainer = styled.div`
  display: flex;
  width: 100%;
  margin: auto 0;
`;

export const StyledCardInfoLabel = styled.p`
  color: white;
  opacity: 0.5;
  width: 50%;
`;

export const StyledCardInfoValue = styled.p`
  width: 50%;
`;

export const StyledTabContent = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 1.5em;
  column-gap: 1em;
  padding: 2em 0;

  @media ${({ theme }) => theme.screen.xs} {
    display: flex;
    column-gap: 20px;
  }
`;

export const StyledNoProfileLabel = styled.p``;

export const StyledCardPropertiesAccordion = styled(Accordion)``;

export const StyledCardProperties = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  row-gap: 20px;
  padding: 20px 0;

  @media ${({ theme }) => theme.screen.sm} {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 20px;
  }

  @media ${({ theme }) => theme.screen.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${({ theme }) => theme.screen.lg} {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const StyledCardPropertyContainer = styled.div`
  display: flex;
  padding: 15px 20px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  column-gap: 10px;
`;

export const StyledCardPropertyIconWrapper = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  height: 50px;
  width: 50px;
`;

export const StyledCardPropertyIcon = styled.img`
  margin: auto;
`;

export const StyledCardProperty = styled.div``;

export const StyledCardPropertyLabel = styled.p`
  color: white;
  opacity: 0.5;
`;

export const StyledCardPropertyValue = styled.p``;

export const StyledMarketAccordion = styled(Accordion)``;

export const StyledHoldersAccordion = styled(Accordion)``;
