import {
  StyledInputContainer,
  StyledPriceInput,
  StyledPriceLabel,
} from './styles';

interface IProps {
  name: string;
  label: string;
  type: string;
  changeHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField = ({ name, label, type, changeHandler }: IProps) => {
  return (
    <StyledInputContainer>
      <StyledPriceLabel>{label}</StyledPriceLabel>
      <StyledPriceInput
        name={name}
        type={type}
        step="any"
        onChange={changeHandler}
      />
    </StyledInputContainer>
  );
};
