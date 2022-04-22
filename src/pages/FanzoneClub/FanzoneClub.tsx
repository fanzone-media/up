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
import { useLocation } from 'react-router-dom';

const FanzoneClub: FC = () => {
  const location = useLocation();
  const [
    validChainIds,
    expectedChainName,
    fanzoneClubContractAddress,
    numbersAfterDecimal,
  ] = useMemo(() => {
    if (location.pathname.includes('test')) {
      return [
        [137],
        'Polygon',
        '0x34c01dD64203b566C4CaE656C832d5a449A34c98',
        7,
      ];
    }
    return [[1], 'Ethereum', '0x4b406ACb6C43Caf306e4662AAf3a4C8e085e6439', 2];
  }, [location]);

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
  const [error, setError] = useState<string>('');

  const mintFanzoneClubCard = useCallback(async () => {
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
  }, [fanzoneClubContract, formInput.amount, formInput.maticAmount]);

  const whitelistMint = useCallback(async () => {
    setError('');
    setStatus(STATUS.LOADING);
    if (!account) return;
    await fanzoneClubContract
      .whitelistMint(
        formInput.amount,
        true,
        await getHexProof(account.address),
        {
          value: formInput.maticAmount,
        },
      )
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
        setError(
          err.reason ? err.reason : err.data ? err.data.message : err.message,
        );
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
    [connectData.connected, network.chain, validChainIds],
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
              Wrong Chain! Please switch to {expectedChainName}
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
                Amount in Ether:{' '}
                {parseFloat(
                  ethers.utils.formatEther(formInput.maticAmount),
                ).toFixed(numbersAfterDecimal)}
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
                href={`https://opensea.io/assets/${fanzoneClubContractAddress}/${transactionResponse.tokenIdMinted}`}
              >
                View pass on OpenSea
              </StyledOpenSeaLink>
              <StyledPolygonScanLink
                target="_blank"
                href={`https://etherscan.io/tx/${transactionResponse.transactionHash}`}
              >
                View tx on etherscan
              </StyledPolygonScanLink>
            </StyledTransactionResponseWrapper>
          </>
        )}
      </StyledFanzoneClubFormContainer>
    </StyledFanzoneClubPage>
  );
};

export default FanzoneClub;
