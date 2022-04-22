import { Signer } from 'ethers';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { NetworkName } from '../../../boot/types';
import { Modal } from '../../../components';
import { KeyManagerApi } from '../../../services/controllers/KeyManager';
import { LSP3ProfileApi } from '../../../services/controllers/LSP3Profile';
import { LSP4DigitalAssetApi } from '../../../services/controllers/LSP4DigitalAsset';
import { IProfile } from '../../../services/models';
import {
  StyledLabel,
  StyledLoader,
  StyledLoadingHolder,
} from '../../AssetDetails/styles';
import {
  StyledErrorLoadingContent,
  StyledErrorText,
  StyledInput,
  StyledInputRow,
  StyledLoadingMessage,
  StyledSaveButton,
} from '../../ProfileDetails/ProfileEditModal/styles';
import { StyledSellCardModalContent } from './styles';

interface IParams {
  add: string;
  network: NetworkName;
  id: string;
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  signer: Signer;
  profile: IProfile;
}

type formInput = {
  amount: number;
};

export const SellCardModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  signer,
  profile,
}: IProps) => {
  const params = useParams<IParams>();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const whiteListedAddress = {
    l14: '',
    mumbai: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
    ethereum: '',
    polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  };
  const [sellCardForm, setSellCardForm] = useState<formInput>({
    amount: 0,
  });

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSellCardForm({
      ...sellCardForm,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const fields = [{ name: 'ammount', label: 'Amount', type: 'number' }];

  const setCardForSale = async () => {
    if (profile.isOwnerKeyManager) {
      await KeyManagerApi.setCardMarketViaKeyManager(
        params.add,
        profile.address,
        profile.owner,
        Number(params.id),
        whiteListedAddress[params.network],
        sellCardForm.amount,
        signer,
      );
    } else {
      await LSP4DigitalAssetApi.sellCard(
        params.add,
        Number(params.id),
        whiteListedAddress[params.network],
        sellCardForm.amount,
        params.network,
      );
    }
  };

  const extendedClose = () => {
    setError(false);
    onClose();
  };

  return isOpen ? (
    <Modal heading="Edit Profile" onClose={extendedClose}>
      {!loading && !error ? (
        <StyledSellCardModalContent>
          {fields.map((item, i) => (
            <StyledInputRow key={i}>
              <StyledLabel>{item.label}</StyledLabel>
              {item.type === 'text' && (
                <StyledInput
                  name={item.name}
                  type={item.type}
                  onChange={changeHandler}
                />
              )}
            </StyledInputRow>
          ))}
          <StyledSaveButton onClick={setCardForSale}>
            Set for Sale
          </StyledSaveButton>
        </StyledSellCardModalContent>
      ) : (
        <StyledErrorLoadingContent>
          {!error ? (
            <>
              <StyledLoadingHolder>
                <StyledLoader color="#ed7a2d" />
              </StyledLoadingHolder>
              <StyledLoadingMessage>
                confirm the metamask transaction and wait ....
              </StyledLoadingMessage>
            </>
          ) : (
            <StyledErrorText>Something went wrong</StyledErrorText>
          )}
        </StyledErrorLoadingContent>
      )}
    </Modal>
  ) : (
    <></>
  );
};
