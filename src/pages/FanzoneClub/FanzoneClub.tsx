import { FC, useState } from 'react';
import { useConnect, useContract, useNetwork, useSigner } from 'wagmi';
import { FanzoneClubCardsImg } from '../../assets';
import { FanzoneClubABI } from '../../services/utilities/ABIs/FanzoneClubABI';
import {
  StyledInput,
  StyledInputLabel,
  StyledBuyClubCardButton,
  StyledInputWrapper,
  StyledErrorMessage,
  StyledFanzoneClubCardsImg,
  StyledFanzoneClubPage,
} from './styles';

export const FanzoneClub: FC = () => {
  const [{ data: connectData }] = useConnect();
  const [{ data: network }] = useNetwork();
  const [{ data: signer }] = useSigner();
  const fanzoneClubContract = useContract({
    addressOrName: '0x5514ef21dDBc956E4f4c2346371867594a6a026E',
    contractInterface: FanzoneClubABI,
    signerOrProvider: signer,
  });
  const [formInput, setFormInput] = useState<{
    maticAmount: number;
    amount: number;
  }>({
    maticAmount: 0,
    amount: 0,
  });
  const [error, setError] = useState<string>();

  const mintFanzoneClubCard = async () => {
    setError('');
    await fanzoneClubContract
      .mint(formInput.amount, true, {
        value: formInput.maticAmount,
      })
      .catch((err: any) => {
        setError(err.data ? err.data.message : err.message);
      });
  };

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setFormInput({
      ...formInput,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  return (
    <StyledFanzoneClubPage>
      <StyledFanzoneClubCardsImg src={FanzoneClubCardsImg} alt="" />
      {!connectData.connected && (
        <StyledErrorMessage>
          Wallet not connected! Please connect via Metamask first
        </StyledErrorMessage>
      )}
      {connectData.connected && network.chain?.id !== 137 && (
        <StyledErrorMessage>
          Wrong Chain! Please switch to Polygon Matic
        </StyledErrorMessage>
      )}
      {error !== '' && <StyledErrorMessage>{error}</StyledErrorMessage>}
      <StyledInputWrapper>
        <StyledInputLabel>Amount in Matic: </StyledInputLabel>
        <StyledInput
          name="maticAmount"
          type="number"
          onChange={inputChangeHandler}
        />
      </StyledInputWrapper>
      <StyledInputWrapper>
        <StyledInputLabel>Amount to mint: </StyledInputLabel>
        <StyledInput
          name="amount"
          type="number"
          onChange={inputChangeHandler}
        />
      </StyledInputWrapper>
      <StyledBuyClubCardButton
        disabled={network.chain?.id !== 137}
        onClick={mintFanzoneClubCard}
      >
        Buy now
      </StyledBuyClubCardButton>
    </StyledFanzoneClubPage>
  );
};
