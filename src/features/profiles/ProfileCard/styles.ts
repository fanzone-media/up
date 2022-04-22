import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BgProfileCard } from '../../../assets';
import { sm } from '../../../utility';
import { cardrender } from '../../../boot/styles/animation';

export const StyledProfileCard = styled(Link)<{ demo?: boolean }>`
  animation: ${cardrender} 1s linear;
  width: ${({ demo }) => (demo ? '165px' : '117px')};
  border-radius: 10px;
  position: relative;
  transition: transform 0.2s ease-in-out;
  border: 1px solid rgba(255, 255, 255, 0.25);

  &:hover {
    transform: scale(1.05);
  }

  @media ${sm} {
    width: ${({ demo }) => (demo ? '212px' : '117px')};
  }
`;

export const StyledProfileDetailWrapper = styled.div<{ demo?: boolean }>`
  display: flex;
  flex-direction: column;
  height: ${({ demo }) => (demo ? '68px' : '53px')};
  background-color: #212121;
  border-radius: 0 0 10px 10px;
  padding: 5px 10px 5px 10px;
`;

export const StyledBalanceWrapper = styled.div<{ demo?: boolean }>`
  display: flex;
  width: ${({ demo }) => (demo ? '30px' : '19px')};
  position: absolute;
  right: 0;
  z-index: 10;
  margin-top: ${({ demo }) => (demo ? '18px' : '14px')};
  margin-right: ${({ demo }) => (demo ? '10px' : '8px')};
`;

export const StyledBalance = styled.p<{ demo?: boolean }>`
  font-size: ${({ demo }) => (demo ? '12px' : '8px')};
  font-weight: 400;
  margin: auto;
`;

export const StyledPolygon = styled.img<{ demo?: boolean }>`
  position: absolute;
  right: 0;
  margin-top: ${({ demo }) => (demo ? '10px' : '8px')};
  margin-right: ${({ demo }) => (demo ? '10px' : '8px')};
  width: ${({ demo }) => (demo ? '30px' : '19px')};
  z-index: 10;
`;

export const StyledProfileDetail = styled.div`
  margin-top: auto;
  margin-bottom: auto;
`;

export const StyledProfileName = styled.h3<{ demo?: boolean }>`
  font-size: ${({ demo }) => (demo ? '18px' : '13px')};
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledProfileRole = styled.p`
  font-size: 13px;
  color: #bcbcbc;
`;

export const StyledProfileMedia = styled.div<{ demo?: boolean }>`
  background: url(${BgProfileCard});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  display: flex;
  z-index: 0;
  height: ${({ demo }) => (demo ? '213px' : '121px')};
  border-radius: 10px 10px 0 0;
`;

export const StyledProfileBlockie = styled.img<{ demo?: boolean }>`
  width: ${({ demo }) => (demo ? '141px' : '89px')};
  height: ${({ demo }) => (demo ? '141px' : '89px')};
  border-radius: 100%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  z-index: -1;

  @media ${sm} {
    height: ${({ demo }) => (demo ? '154px' : '89px')};
    width: ${({ demo }) => (demo ? '154px' : '89px')};
  }
`;

export const StyledProfileImg = styled.img<{ demo?: boolean }>`
  height: ${({ demo }) => (demo ? '121px' : '80px')};
  width: ${({ demo }) => (demo ? '121px' : '80px')};
  margin: auto;
  border-radius: 100%;
  object-fit: cover;

  @media ${sm} {
    width: ${({ demo }) => (demo ? '132px' : '80px')};
    height: ${({ demo }) => (demo ? '132px' : '80px')};
  }
`;
