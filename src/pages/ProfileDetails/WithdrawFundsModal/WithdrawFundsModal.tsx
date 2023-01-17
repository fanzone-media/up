import { BigNumber } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { NetworkName } from '../../../boot/types';
import {
  StyledModalButton,
  StyledModalButtonsWrapper,
} from '../../../components/Modal/styles';
import { TransactionStateWindow } from '../../../components/TransactionStateWindow';
import { useRpcProvider } from '../../../hooks/useRpcProvider';
import { useWitdrawFunds } from '../../../hooks/useWithdrawFunds';
import { ERC20Api } from '../../../services/controllers/ERC20';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { getWhiteListedTokenAddresses } from '../../../utility/content/addresses';
import { Address } from '../../../utils/types';
import {
  StyledBalanceLabel,
  StyledBalanceValue,
  StyledBalanceWrapper,
  StyledRadioInput,
  StyledRadioLabel,
  StyledTokenLabel,
  StyledWithdrawModalContent,
} from './styles';

interface IProps {
  profile: IProfile;
  network: NetworkName;
  onDismiss: () => void;
}

export const WithdrawFundsModal = ({ profile, network, onDismiss }: IProps) => {
  const [whiteListedTokensInfo, setWhiteListedTokensInfo] = useState<
    IWhiteListedTokens[]
  >([]);
  const [balances, setBalances] = useState<
    Array<{ balance: BigNumber; address: string }>
  >([]);
  const [{ data: account }] = useAccount();
  const [selectedTokenInput, setSelectedTokenInput] = useState<Address>('');
  const whiteListedtokensAddresses = getWhiteListedTokenAddresses(network);

  const provider = useRpcProvider(network);
  const { balanceOf, withdrawFunds, withdrawState, resetState } =
    useWitdrawFunds(network);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSelectedTokenInput(event.currentTarget.value);
  };

  const fetchWhiteListedTokenInfo = useCallback(async () => {
    const res = await Promise.all(
      whiteListedtokensAddresses.map(
        async (address) => await ERC20Api.fetchErc20TokenInfo(address, network),
      ),
    );
    setWhiteListedTokensInfo(res);
  }, [provider, whiteListedtokensAddresses]);

  const [selectedTokenBalance, selectedTokenDecimals] = useMemo(() => {
    const balance = balances
      .find(
        (item) =>
          item.address.toLowerCase() === selectedTokenInput.toLowerCase(),
      )
      ?.balance.toString();
    const decimals = whiteListedTokensInfo.find(
      (item) =>
        item.tokenAddress.toLowerCase() === selectedTokenInput.toLowerCase(),
    )?.decimals;
    return [balance, decimals];
  }, [balances, selectedTokenInput, whiteListedTokensInfo]);

  const transactionStatesMessages = {
    loading: {
      mainHeading: 'WITHDRAWING FUNDS. . .',
    },
    successful: {
      mainHeading: 'WITHDRAW SUCCESSFULL',
    },
    failed: {
      mainHeading: 'WITHDRAW FAILED',
      description: 'Please try agian.',
    },
  };

  useEffect(() => {
    fetchWhiteListedTokenInfo();
    balanceOf(whiteListedtokensAddresses, profile.address).then((res) => {
      setBalances(res);
    });
  }, []);

  return (
    <StyledWithdrawModalContent>
      {whiteListedTokensInfo.map((item, i) => (
        <StyledRadioLabel
          key={i}
          htmlFor="token"
          $checked={
            selectedTokenInput.toLowerCase() === item.tokenAddress.toLowerCase()
          }
        >
          <StyledRadioInput
            name="payment"
            type="radio"
            id="token"
            value={item.tokenAddress}
            onChange={changeHandler}
          />
          <StyledTokenLabel>{item.symbol}</StyledTokenLabel>
          <StyledBalanceWrapper>
            <StyledBalanceLabel>Balance: </StyledBalanceLabel>
            <StyledBalanceValue>
              {displayPrice(
                selectedTokenBalance ? selectedTokenBalance : 0,
                selectedTokenDecimals ? selectedTokenDecimals : 0,
              )}
            </StyledBalanceValue>
          </StyledBalanceWrapper>
        </StyledRadioLabel>
      ))}
      <StyledModalButtonsWrapper>
        <StyledModalButton variant="gray" onClick={onDismiss}>
          Cancel
        </StyledModalButton>
        <StyledModalButton
          disabled={!selectedTokenBalance || Number(selectedTokenBalance) <= 0}
          onClick={async () =>
            account &&
            (await withdrawFunds(
              profile,
              selectedTokenInput,
              account.address,
              selectedTokenBalance ? selectedTokenBalance : 0,
            ))
          }
        >
          withdraw to metamask
        </StyledModalButton>
      </StyledModalButtonsWrapper>
      <TransactionStateWindow
        height="full"
        state={withdrawState}
        transactionMessages={transactionStatesMessages}
        callback={resetState}
      />
    </StyledWithdrawModalContent>
  );
};
