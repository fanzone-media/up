import { useState } from 'react';
import { InputField } from '../../components/InputField';
import { StyledModalButton } from '../../components/Modal/styles';
import { useGeneralTransferToken } from '../../hooks/useGeneralTransferToken';
import { useUrlParams } from '../../hooks/useUrlParams';
import { StyledTransfer } from './styles';

type formInput = {
  fromAddress: string;
  toAddress: string;
  cardAddress: string;
  tokenId: number | null;
};

export const Transfer = () => {
  const { network } = useUrlParams();
  const [transferCardForm, setTransferCardForm] = useState<formInput>({
    fromAddress: '',
    toAddress: '',
    cardAddress: '',
    tokenId: null,
  });

  const { transferCard } = useGeneralTransferToken(
    transferCardForm.cardAddress,
    transferCardForm.fromAddress,
    transferCardForm.toAddress,
    transferCardForm.tokenId,
    network,
  );

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setTransferCardForm({
      ...transferCardForm,
      [name]: value,
    });
  };
  return (
    <StyledTransfer>
      <InputField
        name="fromAddress"
        label="From address"
        type="text"
        changeHandler={changeHandler}
      ></InputField>
      <InputField
        name="toAddress"
        label="To address"
        type="text"
        changeHandler={changeHandler}
      ></InputField>
      <InputField
        name="cardAddress"
        label="Card address"
        type="text"
        changeHandler={changeHandler}
      ></InputField>
      <InputField
        name="tokenId"
        label="Token id"
        type="number"
        changeHandler={changeHandler}
      ></InputField>
      <StyledModalButton variant="orange" onClick={transferCard}>
        Transfer
      </StyledModalButton>
    </StyledTransfer>
  );
};
