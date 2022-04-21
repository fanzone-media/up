import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import {
  useAccount,
  useConnect,
  useContract,
  useNetwork,
  useSigner,
} from 'wagmi';
import { FanzoneClubCardsImg } from '../../assets';
import { FanzoneClubABI } from '../../services/utilities/ABIs/FanzoneClubABI';
import { STATUS, isValidConnection } from '../../utility';
import { getHexProof } from '../../utility/merkleHash';
import {
  StyledInputLabel,
  StyledBuyClubCardButton,
  StyledInputWrapper,
  StyledErrorMessage,
  StyledFanzoneClubCardsImg,
  StyledFanzoneClubPage,
  StyledFanzoneClubFormContainer,
  StyledTransactionResponseWrapper,
  StyledOpenSeaLink,
  StyledPolygonScanLink,
  StyledWelcomeTest,
  StyledBackToBuyButton,
  StyledBalanceLabel,
} from './styles';
import { TransactionResponse } from '@ethersproject/providers';
import { StyledLoader, StyledLoadingHolder } from '../AssetDetails/styles';

const validChainIds = [137];
const fanzoneClubContractAddress = '0x5514ef21dDBc956E4f4c2346371867594a6a026E';

const FanzoneClub: FC = () => {
  const [{ data: connectData }] = useConnect();
  const [{ data: network }] = useNetwork();
  const [{ data: signer }] = useSigner();
  const [{ data: account }] = useAccount();
  const fanzoneClubContract = useContract({
    addressOrName: fanzoneClubContractAddress,
    contractInterface: FanzoneClubABI,
    signerOrProvider: signer,
  });
  const [status, setStatus] = useState<STATUS>(STATUS.IDLE);
  const [transactionResponse, setTransactionResponse] = useState<{
    tokenIdMinted: number | null;
    transactionHash: string | null;
  }>({
    transactionHash: null,
    tokenIdMinted: null,
  });
  const [formInput, setFormInput] = useState<{
    maticAmount: BigNumber;
    amount: number;
    publicSale: boolean;
    whiteListSale: boolean;
    ownedPasses: BigNumber;
  }>({
    maticAmount: BigNumber.from(0),
    amount: 1,
    publicSale: false,
    whiteListSale: false,
    ownedPasses: BigNumber.from(0),
  });
  const [error, setError] = useState<string>();

  const mintFanzoneClubCard = async () => {
    setError('');
    setStatus(STATUS.LOADING);
    await fanzoneClubContract
      .mint(formInput.amount, true, {
        value: formInput.maticAmount,
      })
      .then(async (transaction: TransactionResponse) => {
        await transaction.wait(1).then((receipt) => {
          setTransactionResponse({
            tokenIdMinted: parseInt(receipt.logs[1].topics[3]),
            transactionHash: receipt.transactionHash,
          });
          setStatus(STATUS.SUCCESSFUL);
        });
      })
      .catch((err: any) => {
        setError(err.data ? err.data.message : err.message);
        setStatus(STATUS.IDLE);
      });
  };

  const whitelistMint = useCallback(async () => {
    setError('');
    setStatus(STATUS.LOADING);
    if (!account) return;
    await fanzoneClubContract
      .whitelistMint(formInput.amount, true, getHexProof(account.address), {
        value: formInput.maticAmount,
      })
      .then(async (transaction: TransactionResponse) => {
        await transaction.wait(1).then((receipt) => {
          setTransactionResponse({
            tokenIdMinted: parseInt(receipt.logs[1].topics[3]),
            transactionHash: receipt.transactionHash,
          });
          setStatus(STATUS.SUCCESSFUL);
        });
      })
      .catch((err: any) => {
        setError(err.data ? err.data.message : err.message);
        setStatus(STATUS.IDLE);
      });
  }, [fanzoneClubContract, formInput.amount, formInput.maticAmount, account]);

  const validConnection = useMemo(
    () =>
      isValidConnection(
        connectData.connected,
        network.chain?.id || 0,
        validChainIds,
      ),
    [connectData.connected, network.chain],
  );

  useEffect(() => {
    (async () => {
      if (!fanzoneClubContract || !validConnection || !account) return;
      setFormInput({
        ...formInput,
        maticAmount: await fanzoneClubContract.price(),
        publicSale: await fanzoneClubContract.publicSale(),
        whiteListSale: await fanzoneClubContract.whiteListSale(),
        ownedPasses: await fanzoneClubContract.balanceOf(account.address),
      });
    })();
    // Adding formInput to the dependencies array will end up in an infinit loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fanzoneClubContract, validConnection, account]);

  return (
    <StyledFanzoneClubPage>
      <StyledFanzoneClubFormContainer>
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
        {status === STATUS.IDLE && (
          <>
            <StyledBalanceLabel>
              Your owned passes: {formInput.ownedPasses.toNumber()}
            </StyledBalanceLabel>
            <StyledInputWrapper>
              <StyledInputLabel>
                Amount in Matic:{' '}
                {parseFloat(
                  ethers.utils.formatEther(formInput.maticAmount),
                ).toFixed(7)}
              </StyledInputLabel>
            </StyledInputWrapper>
            <StyledInputWrapper>
              <StyledInputLabel>
                Amount to mint: {formInput.amount}
              </StyledInputLabel>
            </StyledInputWrapper>
            {(formInput.whiteListSale || formInput.publicSale) && (
              <StyledBuyClubCardButton
                disabled={!validConnection}
                onClick={() =>
                  formInput.whiteListSale
                    ? whitelistMint()
                    : mintFanzoneClubCard()
                }
              >
                {formInput.whiteListSale
                  ? 'Buy pass now (private sale)'
                  : 'Buy pass now (public sale)'}
              </StyledBuyClubCardButton>
            )}
          </>
        )}
        {status === STATUS.LOADING && (
          <StyledLoadingHolder>
            <StyledLoader color="#ed7a2d" />
          </StyledLoadingHolder>
        )}
        {status === STATUS.SUCCESSFUL && (
          <>
            <StyledBackToBuyButton onClick={() => setStatus(STATUS.IDLE)}>
              {'<'}-- Back to buy more
            </StyledBackToBuyButton>
            <StyledWelcomeTest>
              Welcome to the Fanzone Sports Club!
            </StyledWelcomeTest>
            <StyledTransactionResponseWrapper>
              <StyledOpenSeaLink
                target="_blank"
                href={`https://opensea.io/assets/matic/${fanzoneClubContractAddress}/${transactionResponse.tokenIdMinted}`}
              >
                View pass on OpenSea
              </StyledOpenSeaLink>
              <StyledPolygonScanLink
                target="_blank"
                href={`https://polygonscan.com/tx/${transactionResponse.transactionHash}`}
              >
                View tx on polygonscan
              </StyledPolygonScanLink>
            </StyledTransactionResponseWrapper>
          </>
        )}
      </StyledFanzoneClubFormContainer>
    </StyledFanzoneClubPage>
  );
};

export default FanzoneClub;
