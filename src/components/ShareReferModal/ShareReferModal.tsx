import { useRef, useState } from 'react';
import { isAddress } from 'web3-utils';
import { Facebook, Link, Twitter } from '../../assets';
import { NetworkName } from '../../boot/types';
import { useCopyText } from '../../hooks/useCopyText';
import {
  LOCAL_STORAGE_KEYS,
  useLocalStorage,
} from '../../hooks/useLocalStorage';
import {
  StyledSelectInputContainer,
  StyledUpAddressSelectInput,
  StyledUpAddressSelectLabel,
} from '../../pages/AssetDetails/BuyCardModal/styles';
import { InputField } from '../InputField';
import { StyledModalButton } from '../Modal/styles';
import {
  StyledDivider,
  StyledDivText,
  StyledInputError,
  StyledSeparatorContainer,
  StyledShareLink,
  StyledShareMessage,
  StyledShareOptionsContainer,
  StyledShareReferModalContent,
  StyledShareViaLabel,
} from './styles';

interface IProps {
  network: NetworkName;
  pathName: string;
  onDismiss: () => void;
}

export const ShareReferModal = ({ network, pathName, onDismiss }: IProps) => {
  const { getItems } = useLocalStorage();
  const selectInputRef = useRef<HTMLSelectElement>(null);
  const { copied, copyText } = useCopyText();
  const savedProfiles = getItems(LOCAL_STORAGE_KEYS.UP);
  const savedProfilesAddresses = savedProfiles
    ? Object.keys(savedProfiles[network])
    : null;
  const [referrerAddress, setReferrerAddress] = useState<string>(
    savedProfilesAddresses && savedProfilesAddresses.length > 0
      ? savedProfilesAddresses[0]
      : '',
  );
  const [customReferrerAddress, setCustomReferrerAddress] = useState<boolean>(
    savedProfilesAddresses ? false : true,
  );
  const [inputError, setInputError] = useState<string>('');

  const changeHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setReferrerAddress(event.currentTarget.value);
  };

  const getReferrer = () => {
    return isAddress(referrerAddress) ? `?referrer=${referrerAddress}` : '';
  };

  const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    !isAddress(referrerAddress)
      ? setInputError('wrong address')
      : setInputError('');
  };

  return (
    <StyledShareReferModalContent>
      <StyledShareMessage>
        Share this link and participate in 1% WETH market sales that came
        through you
      </StyledShareMessage>
      {savedProfilesAddresses && (
        <StyledSelectInputContainer>
          <StyledUpAddressSelectLabel>UP Address</StyledUpAddressSelectLabel>
          <StyledUpAddressSelectInput
            ref={selectInputRef}
            defaultValue={savedProfilesAddresses[0]}
            onChange={changeHandler}
          >
            {savedProfilesAddresses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </StyledUpAddressSelectInput>
        </StyledSelectInputContainer>
      )}
      {savedProfilesAddresses && (
        <StyledSeparatorContainer>
          <StyledDivider />
          <StyledDivText>Or</StyledDivText>
          <StyledDivider />
        </StyledSeparatorContainer>
      )}
      {customReferrerAddress && (
        <InputField
          name="otherAddress"
          label="Address"
          type="text"
          changeHandler={changeHandler}
          onBlurHandler={onBlurHandler}
        />
      )}
      {inputError && customReferrerAddress && (
        <StyledInputError>{inputError}</StyledInputError>
      )}
      {savedProfilesAddresses && (
        <StyledModalButton
          variant="gray"
          onClick={() => {
            if (customReferrerAddress) {
              console.log('here');
              selectInputRef.current &&
                setReferrerAddress(selectInputRef.current.value);
            } else {
              setReferrerAddress('');
            }
            setCustomReferrerAddress(!customReferrerAddress);
          }}
        >
          {customReferrerAddress ? 'cancel input' : 'use other address'}
        </StyledModalButton>
      )}

      <StyledShareOptionsContainer>
        <StyledShareViaLabel>Share Via: </StyledShareViaLabel>
        <StyledShareLink
          href={`https://twitter.com/intent/tweet?url=${
            window.location.origin
          }/#${pathName}${getReferrer()}`}
        >
          <img src={Twitter} alt="Twitter" title="twitter" />
        </StyledShareLink>
        <StyledShareLink
          href={`https://www.facebook.com/sharer.php?u=${
            window.location.origin
          }/#${pathName}${getReferrer()}`}
        >
          <img src={Facebook} alt="Facebook" title="facebook" />
        </StyledShareLink>
        <StyledShareLink
          as="button"
          onClick={() =>
            copyText(`${window.location.origin}/#${pathName}${getReferrer()}`)
          }
        >
          <img src={Link} alt="Copy Link" title="copy link" />
          {copied ? 'Copied!' : 'Copy Link'}
        </StyledShareLink>
      </StyledShareOptionsContainer>
      <StyledModalButton variant="gray" onClick={onDismiss}>
        Cancel
      </StyledModalButton>
    </StyledShareReferModalContent>
  );
};
