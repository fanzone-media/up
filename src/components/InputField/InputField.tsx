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
  align?: string;
  placeholder?: string;
  value?: string;
}

export const InputField = ({
  name,
  label,
  type,
  changeHandler,
  align,
  placeholder,
  value,
}: IProps) => {
  return (
    <StyledInputContainer>
      <StyledPriceLabel>{label}</StyledPriceLabel>
      <StyledPriceInput
        name={name}
        type={type}
        step="any"
        onChange={changeHandler}
        align={align}
        placeholder={placeholder}
        value={value}
      />
    </StyledInputContainer>
  );
};
