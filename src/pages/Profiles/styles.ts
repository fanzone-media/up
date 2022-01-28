import styled from 'styled-components';
import { BgFanzoneHero } from '../../assets';
import { lg, md, xl } from '../../utility';

export const StyledMainContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  color: white;
`;

export const StyledHeroSection = styled.div`
  height: 243px;
  width: 100%;
  background: url(${BgFanzoneHero});
  background-position: center;
  background-repeat: repeat;
  background-size: cover;
`;

export const StyledContentwrappar = styled.div`
  width: 100%;
  padding: 0px 8px 0 8px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;

  @media ${md} {
    padding: 0 40px 0 40px;
    max-width: 1440px;
  }
`;

export const StyledGreeting = styled.div`
  padding-top: 20px;
`;

export const StyledWelcomeHeading = styled.h1`
  font-size: 24px;
  font-weight: 700;
`;

export const StyledDescription = styled.p`
  font-size: 18px;
  font-weight: 400;
`;

export const StyledDivider = styled.span`
  border-bottom: 1px solid #dfdfdf;
  width: 100%;
  margin-top: 20px;
`;

export const StyledProfilesHeader = styled.div`
  padding-top: 20px;
  display: flex;
`;

export const StyledProfileHeading = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin-right: auto;
`;

export const StyledProfilesWrappar = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  padding: 20px 0 20px 0;
  justify-items: center;

  @media ${md} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media ${lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media ${xl} {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`;

export const StyledErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: 40px auto 0 auto;
  row-gap: 10px;
`;

export const StyledError = styled.h1`
  font-size: 24px;
`;

export const StyledReloadButton = styled.button`
  background: black;
  padding: 8px 16px 8px 16px;
  border-radius: 6px;
  margin-right: auto;
  margin-left: auto;
`;
