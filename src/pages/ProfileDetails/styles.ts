import styled from 'styled-components';

export const StyledProfileDetails = styled.div`
  color: white;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const StyledProfileDetailsContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledProfileNotFound = styled.h1`
  font-size: 30px;
  margin: 60px auto 0 auto;
`;

export const StyledProfileCoverImg = styled.img`
  width: 100%;
  height: 243px;
  object-position: center;
  object-fit: cover;
  display: block;
`;

export const StyledProfileInfoWrapper = styled.div`
  width: 100%;
`;

export const StyledProfileInfo1 = styled.div`
  width: 100%;
  padding: 0 8px 0 8px;
  background-color: rgba(33, 33, 33, 1);
  display: flex;
`;

export const StyledProfileInfo1Content = styled.div`
  position: relative;
  display: flex;
  padding: 20px 0 20px 0;
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    align-items: center;
    display: grid;
    width: 1440px;
    grid-template-columns: calc(50% - 90px) 180px calc(50% - 90px);
    grid-column-gap: 2.5em;
    padding: 20px 40px 20px 40px;
    margin: 0 auto 0 auto;
  }
`;

export const StyledProfileMediaWrapper = styled.div`
  position: relative;
  padding: 0 5% 0 5%;
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    padding: 0;
  }
`;

export const StyledProfileMedia = styled.div`
  position: relative;
  margin-left: auto;
  margin-right: auto;

  @media ${({ theme }) => theme.screen.md} {
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    left: 50%;
    width: 100%;
  }
`;

export const StyledProfileAddress = styled.p`
  font-weight: ${({ theme }) => theme.font.weight.light};
  letter-spacing: 1.5px;
  width: calc(100% - 180px);
  overflow-wrap: break-word;
  color: rgba(165, 165, 165, 1);
  font-size: 14px;

  @media ${({ theme }) => theme.screen.md} {
    width: 100%;
    font-size: 16px;
  }
`;

export const StyledProfileNameBioWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto 0 auto 0;
  row-gap: 5px;
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    flex-direction: row;
    align-items: center;
  }
`;

export const StyledProfileName = styled.h2`
  font-size: 17px;
  font-weight: ${({ theme }) => theme.font.weight.bolder};
  margin: auto 0 auto 0;

  @media ${({ theme }) => theme.screen.md} {
    font-size: 15px;
    margin: 0 0 0 5%;
  }
`;

export const StyledProfileBioHeading = styled.h2`
  font-weight: ${({ theme }) => theme.font.weight.bolder};
  font-size: 15px;
`;

export const StyledProfileBioWrapper = styled.div`
  margin: auto 0 auto 0;

  @media ${({ theme }) => theme.screen.md} {
    width: calc(50% - 90px);
    margin-left: auto;
    padding-left: 2.5%;
  }
`;

export const StyledProfileBio = styled.p`
  font-size: 15px;
`;

export const StyledProfileLinks = styled.div`
  display: flex;
  margin: auto 0 auto 0;
  column-gap: 10px;

  @media ${({ theme }) => theme.screen.md} {
    margin: auto 0 auto auto;
  }
`;

export const StyledProfileInfo2 = styled.div`
  width: 100%;
  padding: 0 8px 0 8px;
  background-color: rgba(59, 59, 59, 1);

  @media ${({ theme }) => theme.screen.md} {
    max-width: 1440px;
    padding: 0 40px 0 40px;
    margin: 0 auto 0 auto;
    background-color: transparent;
  }
`;

export const StyledProfileInfo2Content = styled.div`
  display: flex;
  padding: 20px 0 20px 0;
`;

export const StyledShareProfileHolder = styled.div`
  position: relative;

  @media ${({ theme }) => theme.screen.md} {
    margin-left: auto;
  }
`;

export const StyledShareProfileWrapper = styled.div<{ expand: boolean }>`
  background-color: rgba(59, 59, 59, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  width: 162px;
  height: ${({ expand }) => (expand ? '160px' : '37px')};
  display: flex;
  flex-direction: column;
  padding: 6px;
  overflow: hidden;
  margin: auto 0;
  position: ${({ expand }) => (expand ? 'absolute' : '')};

  @media ${({ theme }) => theme.screen.md} {
    margin: 0;
    right: 0;
  }
`;

export const StyledShareIcon = styled.img`
  margin: auto;
`;

export const StyledDropDownIcon = styled.img`
  margin: auto;
`;

export const StyledShareProfileHeader = styled.div<{ expand: boolean }>`
  display: flex;
  cursor: pointer;
`;

export const StyledTwitterShare = styled.a<{ expand: boolean }>`
  display: flex;
  margin: ${({ expand }) => (expand ? 'auto 0 auto 6px' : '7px 0 auto 0')};
`;

export const StyledTwitterIcon = styled.img`
  margin-right: 7px;
`;

export const StyledFaceBookShare = styled.a`
  display: flex;
  margin: auto 0 auto 8px;
`;

export const StyledFacebookIcon = styled.img`
  margin-right: 13px;
`;

export const StyledCopyLink = styled.button`
  display: flex;
  margin: auto 0 auto 7px;
`;

export const StyledCopyLinkIcon = styled.img`
  margin: auto 7px auto 0;
`;

export const StyledAssetsWrapper = styled.div`
  width: 100%;
  padding: 0 8px 0 8px;

  @media ${({ theme }) => theme.screen.md} {
    padding: 0 40px 0 40px;
    max-width: 1440px;
    margin: 0 auto 0 auto;
  }
`;

export const StyledLinkIcon = styled.img``;

export const StyledOpenTransferModalButton = styled.button`
  background-color: rgba(33, 33, 33, 1);
  max-width: max-content;
  margin: 20px auto;
  padding: 5px 10px;
  border-radius: 8px;

  @media ${({ theme }) => theme.screen.md} {
    margin: 0 auto;
  }
`;

export const HideOnScreen = styled.div<{
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>`
  @media ${({ theme, size }) => theme.screen[size]} {
    display: none;
  }
`;
