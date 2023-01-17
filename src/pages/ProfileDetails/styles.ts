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
  font-size: 1.875rem;
  margin: 60px auto 0 auto;
`;

export const StyledProfileCoverImg = styled.img`
  width: 100%;
  height: 15em;
  object-position: center;
  object-fit: cover;
  display: block;
`;

export const StyledProfileInfoWrapper = styled.div`
  width: 100%;
`;

export const StyledProfileInfo1 = styled.div`
  width: 100%;
  padding: 0 0.5em;
  background-color: rgba(33, 33, 33, 1);
  display: flex;
`;

export const StyledProfileInfo1Content = styled.div`
  position: relative;
  display: flex;
  padding: 1.25em 0;
  width: 100%;

  @media ${({ theme }) => theme.screen.md} {
    --profile-image-size: 11.25em;
    --outer-columns-width: calc(
      50% - 2.5em - calc(var(--profile-image-size) / 2)
    );
    align-items: center;
    display: grid;
    width: 1440px;
    grid-template-columns:
      var(--outer-columns-width) var(--profile-image-size)
      var(--outer-columns-width);
    grid-column-gap: 2.5em;
    padding: 1.25em 2.5em;
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
  overflow-wrap: break-word;
  color: rgba(165, 165, 165, 1);
  font-size: min(0.875rem, 3.5vw);

  @media ${({ theme }) => theme.screen.md} {
    width: calc(100% - 12.85em);
    width: 100%;
    font-size: 1rem;
  }
`;

export const StyledProfileNameBioWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto 0 auto 0;
  row-gap: 0.25em;
  width: 100%;

  @media ${({ theme }) => theme.screen.lg} {
    flex-direction: row;
    column-gap: 0.25em;
    align-items: center;
  }
`;

export const StyledProfileName = styled.h2`
  font-size: 1.0625rem;
  font-weight: ${({ theme }) => theme.font.weight.bolder};
  margin: auto 0 auto 0;

  @media ${({ theme }) => theme.screen.md} {
    font-size: 1.125rem;
    margin: 0 0 0 5%;
  }
`;

export const StyledProfileBioHeading = styled.h2`
  font-weight: ${({ theme }) => theme.font.weight.bolder};
  font-size: 0.9375rem;
`;

export const StyledProfileBioWrapper = styled.div`
  margin: auto 0;

  @media ${({ theme }) => theme.screen.md} {
    width: calc(50% - 5.625em);
    padding-left: 2.5%;
  }
`;

export const StyledProfileBio = styled.p`
  font-size: 0.9375rem;
`;

export const StyledProfileLinks = styled.div`
  display: flex;
  margin-right: 2.5em;
  column-gap: 1.5em;
`;

export const StyledProfileInfo2 = styled.div`
  width: 100%;
  padding: 0 0.5em;
  background-color: rgba(59, 59, 59, 1);

  @media ${({ theme }) => theme.screen.md} {
    max-width: 1440px;
    padding: 0 2.5em;
    margin: 0 auto 0 auto;
    background-color: transparent;
  }
`;

export const StyledProfileInfo2Content = styled.div`
  display: flex;
  padding: 1.25em 0 1.25em 0;
`;

export const StyledShareProfileHolder = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  row-gap: 1.35em;
  margin-top: 1.35em;

  @media ${({ theme }) => theme.screen.lg} {
    flex-direction: row;
    margin-left: auto;
    margin-top: 0;
  }
`;

export const StyledProfileSettingButton = styled.button`
  background-color: rgba(59, 59, 59, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  height: 2em;
  padding: 0 0.5em;
  width: max-content;
`;

export const StyledSettingIcon = styled.img`
  height: 1.5em;
`;

export const StyledShareProfileWrapper = styled.div`
  position: relative;
  overflow: visible;
  width: max-content;
`;

export const StyledShareIcon = styled.img`
  height: 0.875em;
`;

export const StyledDropDownIcon = styled.img`
  display: inline-block;
  margin-left: 0.5em;
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
  padding: 0 0.5em;

  @media ${({ theme }) => theme.screen.md} {
    padding: 0 2.5em;
    max-width: 1440px;
    margin: 0 auto 0 auto;
  }
`;

export const StyledLinkIconWrapper = styled.a`
  display: flex;
  justify-content: center;
`;

export const StyledLinkIcon = styled.img``;

export const StyledOpenTransferModalButton = styled.button`
  background-color: rgba(33, 33, 33, 1);
  max-width: max-content;
  margin: 1.25em auto;
  padding: 5px 0.625em;
  border-radius: 8px;

  @media ${({ theme }) => theme.screen.md} {
    margin: 2em auto 0 auto;
  }
`;

export const StyledOpenEditProfileModal = styled(
  StyledOpenTransferModalButton,
)``;

export const StyledWitdrawFundsButton = styled(StyledOpenTransferModalButton)``;

export const StyledClaimAuctionTokenButton = styled(
  StyledOpenEditProfileModal,
)``;

export const StyledShareProfileButton = styled.button`
  align-items: center;
  column-gap: 1.25em;
  background-color: rgba(59, 59, 59, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  padding: 0.5em 0.75em;
  font-size: 0.9375rem;
  overflow: hidden;
  margin: auto 0;
  display: flex;

  @media ${({ theme }) => theme.screen.md} {
    margin: 0;
    right: 0;
    border-bottom-color: rgba(255, 255, 255, 0.15);
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    height: 2em;
    padding: 0 0.5em;
  }
`;

export const StyledShareDropDown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  background-color: rgba(59, 59, 59, 1);
  border-width: 0px 1px 1px;
  border-color: rgba(255, 255, 255, 0.15);
  border-style: solid;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  z-index: 10;
  animation: ${({ theme }) => theme.animation.cardrender} 0.2s linear;

  @media ${({ theme }) => theme.screen.md} {
    border-top-width: 1px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    top: calc(100% + 0.5em);
    width: max-content;
  }
`;

export const ShareLink = styled.a.attrs({
  target: '_blank',
})`
  align-items: center;
  display: flex;
  column-gap: 1.25em;
  padding: 0.5em 0.75em;

  @media ${({ theme }) => theme.screen.md} {
    width: max-content;
  }
`;
