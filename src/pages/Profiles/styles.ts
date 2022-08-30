import styled from 'styled-components';
import { HeaderBackground, HeaderAd, BodyBackground } from '../../assets';

export const StyledMainContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  color: white;
  background: url(${BodyBackground});
`;

export const StyledHeaderSection = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  width: 100%;
  padding: 40px 15px 70px;
  background: linear-gradient(
      0deg,
      rgba(33, 33, 33, 0.7),
      rgba(33, 33, 33, 0.7)
    ),
    url(${HeaderBackground});
  background-size: cover;

  @media ${({ theme }) => theme.screen.md} {
    flex-flow: row;
    padding: 70px 20px;
  }

  @media ${({ theme }) => theme.screen.lg} {
    padding: 90px 120px;
  }
`;

export const StyledHeading = styled.h1`
  font-size: 25px;
  padding: 15px 0;
  text-align: center;
  text-transform: uppercase;

  @media ${({ theme }) => theme.screen.md} {
    font-size: 45px;
    text-align: left;
  }
`;

export const StyledHeaderContent = styled.div`
  @media ${({ theme }) => theme.screen.md} {
    max-width: 550px;
  }
`;

export const StyledInfoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-flow: column;
  padding: 45px 15px 0 15px;

  @media ${({ theme }) => theme.screen.md} {
    flex-flow: row;
    padding: 40px 30px;
  }

  @media ${({ theme }) => theme.screen.lg} {
    flex-flow: row;
    padding: 40px 30px;
    align-items: start;
  }

  @media ${({ theme }) => theme.screen.xl} {
    flex-flow: row;
    padding: 90px 120px;
  }
`;

export const StyledNftInfoSection = styled(StyledInfoSection)`
  align-items: start;
  @media ${({ theme }) => theme.screen.md} {
    flex-flow: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
`;

export const StyledInfoHeading = styled(StyledHeading)`
  @media ${({ theme }) => theme.screen.md} {
    font-size: 40px;
  }
`;

export const StyledImg = styled.img`
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

export const StyledContentwrappar = styled.div`
  width: 100%;
  margin-left: auto;
  padding: 0 15px 0 15px;
  margin-right: auto;
  display: flex;
  flex-direction: column;

  @media ${({ theme }) => theme.screen.md} {
    max-width: 1440px;
  }
`;

export const StyledDivider = styled.span`
  height: 1px;
  width: 100%;
  margin-top: 20px;
  background: radial-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0)),
    rgba(33, 33, 33, 0.6);
`;

export const StyledProfilesHeader = styled.div`
  padding-top: 20px;
  display: flex;
`;

export const StyledProfileHeading = styled.h1`
  font-size: 24px;
  font-weight: ${({ theme }) => theme.font.weight.bolder};
  margin-right: auto;
`;

export const StyledProfilesWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  padding: 20px 0 20px 0;
  justify-items: center;

  @media ${({ theme }) => theme.screen.md} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media ${({ theme }) => theme.screen.lg} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media ${({ theme }) => theme.screen.xl} {
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

export const StyledDescription = styled.p`
  font-size: 16px;
  color: #ffffff;
  text-align: center;
  opacity: 0.4;

  @media ${({ theme }) => theme.screen.md} {
    font-size: 20px;
    text-align: left;
  }
`;

export const StyledContainer = styled.div``;

export const StyledLuksoIcon = styled.div`
  width: 90px;
  height: 15px;
  margin: auto;
`;

export const StyledLuksoBadge = styled.div`
  width: 225px;
  height: 225px;
  margin: 0 auto 25px auto;
`;

export const StyledLuksoLogo = styled.div`
  margin-bottom: 15px;

  @media ${({ theme }) => theme.screen.md} {
    margin-right: 30px;
  }
`;

export const StyledInfoContent = styled.div`
  @media ${({ theme }) => theme.screen.md} {
    max-width: 850px;
  }
`;

export const StyledAd = styled.div`
  height: 396px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)),
    url(${HeaderAd});
  background-size: cover;

  @media ${({ theme }) => theme.screen.md} {
    width: 520px;
    height: 295px;
    margin-left: 50px;
    border: 1px solid white;
    border-radius: 5px;
  }
`;

export const StyledNftInfoIcon = styled.div`
  width: 72px;
  height: 72px;
  margin-right: 22px;
  flex-shrink: 0;
`;

export const StyledNftInfoText = styled.p`
  font-size: 19px;
  color: #ffffffcc;

  @media ${({ theme }) => theme.screen.md} {
    max-width: 240px;
  }
`;

export const StyledNftInfo = styled.div`
  display: flex;
  margin: 30px 0;

  @media ${({ theme }) => theme.screen.md} {
    margin: 50px 10px;
  }

  @media ${({ theme }) => theme.screen.lg} {
    margin: 50px 20px;
  }
`;
