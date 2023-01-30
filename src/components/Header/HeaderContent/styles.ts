import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const StyledButtonConainer = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;

  @media ${({ theme }) => theme.screen.md} {
    height: 100%;
    width: 100%;
    column-gap: 20px;
    row-gap: none;
    flex-direction: row;
    justify-content: flex-end;
  }
`;

export const StyledMyUpLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  width: 180px;
  border: 1px solid white;
  margin: 0 auto;
  box-sizing: border-box;
  filter: drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.15));
  border-radius: 3px;
  text-align: center;
  line-height: 35px;

  @media ${({ theme }) => theme.screen.md} {
    margin: auto 0;
  }
`;

export const StyledButtonIcon = styled.img`
  padding: 0 8px 0 0;
`;

export const StyledButtonText = styled.p``;

export const StyledConnectMetaMask = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  width: 180px;
  border: 1px solid white;
  margin: 0 auto;
  box-sizing: border-box;
  filter: drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.15));
  border-radius: 3px;

  @media ${({ theme }) => theme.screen.md} {
    margin: auto 0;
  }
`;

export const StyledSignUpLink = styled.a`
  margin: 0 auto;
  width: 180px;
  height: 35px;
  text-align: center;
  line-height: 35px;
  vertical-align: middle;
  background: linear-gradient(180deg, #ff9b00 0%, #ff5c00 100%);
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.15);
  border-radius: 3px;

  @media ${({ theme }) => theme.screen.md} {
    margin: auto 0;
  }
`;
