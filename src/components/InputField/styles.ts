import styled from 'styled-components';

export const StyledInputContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
`;

export const StyledPriceLabel = styled.p`
  position: absolute;
  padding: 0 0.5em;
  margin: -0.75em 0 0 0.5em;
  background-color: rgba(49, 49, 49, 1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

export const StyledPriceInput = styled.input`
  background: transparent;
  color: white;
  border: 1px solid rgba(153, 153, 153, 1);
  border-radius: 0.3em;
  padding: 0.5em 0.5em;
  text-align: end;
  width: 100%;
`;
