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

export const StyledPriceInput = styled.input<{ align?: string }>`
  background: transparent;
  color: white;
  cursor: pointer;
  border: 1px solid rgba(153, 153, 153, 1);
  border-radius: 0.3em;
  padding: 0.5em 0.5em;
  text-align: ${({ align }) => (align ? align : 'end')};
  width: 100%;
`;

export const FileInput = styled.span<{ fileName: string }>`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 2.5rem;
  padding: 0.5rem 1rem;
  line-height: 1.5;
  color: #555;
  cursor: pointer;
  background-color: rgba(49, 49, 49, 1);
  border: 0.075rem solid #ddd;
  border-radius: 0.25rem;
  box-shadow: inset 0 0.2rem 0.4rem rgb(0 0 0 / 5%);
  user-select: none;
  overflow: hidden;

  &::before {
    position: absolute;
    top: -0.075rem;
    right: -0.075rem;
    bottom: -0.075rem;
    display: block;
    content: 'Browse';
    height: 2.5rem;
    padding: 0.5rem 1rem;
    line-height: 1.5;
    color: #ddd;
    background-color: #999;
    border: 0.075rem solid #999;
    border-radius: 0 0.3em 0.3em 0;
  }

  &::after {
    content: ${({ fileName }) =>
      fileName ? `'${fileName}'` : 'Choose a file…'};
    color: #ddd;
  }
`;

export const HiddenFileInputWrapper = styled.div`
  position: relative;
  height: 2.5rem;

  &:hover ${FileInput}::before {
    background-color: #ddd;
    color: #999;
  }
`;

export const HiddenFileInput = styled.input.attrs({
  type: 'file',
})`
  margin: 0;
  min-with: 14em;
  opacity: 0;
`;
