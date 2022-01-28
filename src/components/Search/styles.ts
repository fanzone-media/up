import styled from 'styled-components';
import { sm } from '../../utility';

export const StyledInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  height: 32px;
  width: 165px;
  border: 0.5px solid #979797;
  border-radius: 5px;
  padding: 0 10px 0 30px;

  @media ${sm} {
    width: 353px;
  }
`;

export const StyledInputWrappar = styled.div`
  position: relative;
`;

export const StyledSearchIcon = styled.img`
  position: absolute;
  top: 50%;
  margin-left: 10px;
  transform: translate3d(0, -55%, 0);
`;
