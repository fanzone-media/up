import React from 'react';
import { StyledInput, StyledInputWrapper, StyledSearchIcon } from './styles';
import { SearchIcon } from '../../assets';

interface IProps {
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export const Search: React.FC<IProps> = ({ onChange }: IProps) => {
  return (
    <StyledInputWrapper>
      <StyledSearchIcon src={SearchIcon} />
      <StyledInput placeholder="Search" onChange={onChange}></StyledInput>
    </StyledInputWrapper>
  );
};
