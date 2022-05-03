import React from 'react';
import { StyledModalContainer } from './styles';

interface IProps {
  children: React.ReactNode;
}

export const Modal: React.FC<IProps> = ({ children }: IProps) => {
  return <StyledModalContainer>{children}</StyledModalContainer>;
};
