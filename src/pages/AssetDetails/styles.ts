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
  padding-top: 1em;

  @media ${({ theme }) => theme.screen.md} {
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
    padding: 48px 40px 0 40px;
    row-gap: 30px;
  }

  @media ${({ theme }) => theme.screen.lg} {
    padding: 48px 40px 0 40px;
    flex-direction: row;
    column-gap: 2em;
  }
`;

export const StyledExplorerIcon = styled.img`
  position: absolute;
  width: 44px;
  height: 44px;
  bottom: 0;
  left: 0;
  margin: 0 0 20px 20px;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
`;

export const StyledOpenseaIcon = styled.img`
  position: absolute;
  width: 44px;
  height: 44px;
  right: 0;
  margin: 20px 20px 0 0;
  animation: ${pulseAnimate} 2s ease-in-out infinite;
`;

export const StyledLabel = styled.p`
  font-size: 15px;
`;

// Re designed styled components

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

export const StyledSelectMintModalButton = styled.button`
  border: 0.1em solid white;
  padding: 0 0.3em;
  border-radius: 0.2em;
`;

export const StyledMintSliderInput = styled.input`
  background: transparent;
  border: 0.1em solid white;
  height: 1.5em;
  margin: auto 0;
  text-align: center;
  -moz-appearance: textfield;

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const StyledMintSliderIndex = styled.p`
  margin: auto 0;
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
  width: max-content;
  height: 30px;
  grid-template-columns: repeat(3, minmax(2em, 1fr));
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

export const StyledDividerSpan = styled.span`
  border: 0.01em solid rgba(223, 223, 223, 0.2);
  width: 100%;
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
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${({ theme }) => theme.screen.lg} {
    grid-template-columns: repeat(2, 1fr);
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

// hackathon changes

export const StyledMediaContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  row-gap: 1.5em;

  @media ${({ theme }) => theme.screen.lg} {
    width: 50%;
    row-gap: 2em;
  }
`;

export const StyledHeroImgContainer = styled.div`
  position: relative;
`;

export const StyledHeroImg = styled.img`
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    border-radius: 0.5em;
  }
`;

export const StyledOtherMediaContainer = styled.div`
  display: flex;
  column-gap: 2em;
  row-gap: 2em;
  overflow-x: scroll;
  height: 15em;

  @media ${({ theme }) => theme.screen.lg} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    height: auto;
  }
`;

export const StyledOtherImg = styled.img`
  @media ${({ theme }) => theme.screen.md} {
    border-radius: 0.5em;
  }
`;

export const StyledAssetDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  row-gap: 2em;

  @media ${({ theme }) => theme.screen.lg} {
    width: 50%;
  }
`;

export const StyledContractDetailHeader = styled.div`
  display: flex;
`;

export const StyledContractName = styled.h2`
  margin: 0 auto;
`;

export const StyledContractDescription = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
`;
