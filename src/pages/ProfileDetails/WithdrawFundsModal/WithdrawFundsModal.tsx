import { BigNumber } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { NetworkName } from '../../../boot/types';
import { useRpcProvider } from '../../../hooks/useRpcProvider';
import { useWitdrawFunds } from '../../../hooks/useWithdrawFunds';
import { LSP4DigitalAssetApi } from '../../../services/controllers/LSP4DigitalAsset';
import { IProfile, IWhiteListedTokens } from '../../../services/models';
import { displayPrice } from '../../../utility';
import { getWhiteListedTokenAddresses } from '../../../utility/content/addresses';
import { Address } from '../../../utils/types';
import {
  StyledSelectWithdrawToken,
  StyledWithdrawFundsButton,
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
  const { balanceOf, withdrawFunds } = useWitdrawFunds(network);

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSelectedTokenInput(event.currentTarget.value);
  };

  const fetchWhiteListedTokenInfo = useCallback(async () => {
    const res = await Promise.all(
      whiteListedtokensAddresses.map(
        async (address) =>
          await LSP4DigitalAssetApi.fetchErc20TokenInfo(address, provider),
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

  useEffect(() => {
    fetchWhiteListedTokenInfo();
    balanceOf(whiteListedtokensAddresses, profile.address).then((res) => {
      setBalances(res);
    });
  }, []);

  return (
    <StyledWithdrawModalContent>
      <p>select token to withdraw: </p>
      <StyledSelectWithdrawToken onChange={changeHandler}>
        <option>Select token</option>
        {whiteListedTokensInfo.map((item) => (
          <option value={item.tokenAddress}>{item.symbol}</option>
        ))}
      </StyledSelectWithdrawToken>
      <p>
        Your Balance:{' '}
        {displayPrice(
          selectedTokenBalance ? selectedTokenBalance : 0,
          selectedTokenDecimals ? selectedTokenDecimals : 0,
        )}
      </p>
      <StyledWithdrawFundsButton
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
      </StyledWithdrawFundsButton>
    </StyledWithdrawModalContent>
  );
};
