import { FC, useState, useEffect, useCallback } from 'react';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { useConnect, useContract, useNetwork, useSigner } from 'wagmi';
import { FanzoneClubCardsImg } from '../../assets';
import { FanzoneClubABI } from '../../services/utilities/ABIs/FanzoneClubABI';
import { isValidConnection } from '../../utility';
import {
  StyledInput,
  StyledInputLabel,
  StyledBuyClubCardButton,
  StyledInputWrapper,
  StyledErrorMessage,
  StyledFanzoneClubCardsImg,
  StyledFanzoneClubPage,
} from './styles';
import { connected } from 'process';

const validChainIds = [137];

export const FanzoneClubTest: FC = () => {
  const [{ data: connectData }] = useConnect();
  const [{ data: network }] = useNetwork();
  const [{ data: signer }] = useSigner();
  const fanzoneClubContract = useContract({
    addressOrName: '0x5514ef21dDBc956E4f4c2346371867594a6a026E',
    contractInterface: FanzoneClubABI,
    signerOrProvider: signer,
  });
  const [priceInEth, setPriceInEth] = useState<BigNumberish>(0);
  const [formInput, setFormInput] = useState<{
    maticAmount: number;
    amount: number;
  }>({
    maticAmount: 0,
    amount: 1,
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

  const validConnection = useCallback(
    () =>
      isValidConnection(
        connectData.connected,
        network.chain?.id || 0,
        validChainIds,
      ),
    [connectData.connected, network.chain?.id],
  );

  useEffect(() => {
    (async () => {
      if (!fanzoneClubContract || !validConnection) return;
      const priceInGwei: BigNumber = await fanzoneClubContract.price();

      setFormInput({
        ...formInput,
        maticAmount: parseInt(ethers.utils.formatEther(priceInGwei.mul(1e9))),
      });
    })();
    // Adding formInput to the dependencies array will end up in an infinit loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fanzoneClubContract, validConnection]);

  console.log(validConnection);

  return (
    <StyledFanzoneClubPage>
      <StyledFanzoneClubCardsImg src={FanzoneClubCardsImg} alt="" />
      {!connectData.connected ? (
        <StyledErrorMessage>
          Wallet not connected! Please connect via Metamask first
        </StyledErrorMessage>
      ) : (
        !validConnection && (
          <StyledErrorMessage>
            Wrong Chain! Please switch to Polygon Matic
          </StyledErrorMessage>
        )
      )}
      {error !== '' && <StyledErrorMessage>{error}</StyledErrorMessage>}
      <StyledInputWrapper>
        <StyledInputLabel>
          Amount in Matic: {formInput.maticAmount}
        </StyledInputLabel>
        {/* <StyledInput
          name="maticAmount"
          type="number"
          onChange={inputChangeHandler}
        /> */}
      </StyledInputWrapper>
      <StyledInputWrapper>
        <StyledInputLabel>Amount to mint: {formInput.amount}</StyledInputLabel>
        {/* <StyledInput
          name="amount"
          type="number"
          onChange={inputChangeHandler}
        /> */}
      </StyledInputWrapper>
      <StyledBuyClubCardButton
        disabled={!validConnection}
        onClick={mintFanzoneClubCard}
      >
        Buy now
      </StyledBuyClubCardButton>
    </StyledFanzoneClubPage>
  );
};
