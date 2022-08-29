import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useNetwork, useSigner } from 'wagmi';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import {
  StyledAddPermissions,
  StyledInputWrapper,
  StyledInput,
  StyledLabel,
  StyledPermissionInputWrapper,
  StyledCheckboxInput,
  StyledSetPermisssionButton,
  StyledNetworkLabel,
} from './styles';

interface IProps {
  upAddress: string;
}

type formInput = {
  addressTo: string;
  permissions: {
    CHANGEOWNER: boolean;
    CHANGEPERMISSIONS: boolean;
    ADDPERMISSIONS: boolean;
    SETDATA: boolean;
    CALL: boolean;
    STATICCALL: boolean;
    DELEGATECALL: boolean;
    DEPLOY: boolean;
    TRANSFERVALUE: boolean;
    SIGN: boolean;
  };
};

export const AddPermissions = ({ upAddress }: IProps) => {
  const [{ data }] = useSigner();
  const [permissionsForm, setpermissionsForm] = useState<formInput>({
    addressTo: '',
    permissions: {
      CHANGEOWNER: false,
      CHANGEPERMISSIONS: false,
      ADDPERMISSIONS: false,
      SETDATA: false,
      CALL: false,
      STATICCALL: false,
      DELEGATECALL: false,
      DEPLOY: false,
      TRANSFERVALUE: false,
      SIGN: false,
    },
  });

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.type === 'checkbox') {
      event.currentTarget.checked
        ? setpermissionsForm({
            ...permissionsForm,
            permissions: {
              ...permissionsForm.permissions,
              [event.currentTarget.name]: true,
            },
          })
        : setpermissionsForm({
            ...permissionsForm,
            permissions: {
              ...permissionsForm.permissions,
              [event.currentTarget.name]: false,
            },
          });
    } else {
      setpermissionsForm({
        ...permissionsForm,
        [event.currentTarget.name]: event.currentTarget.value,
      });
    }
  };

  const setPermissions = async () => {
    if (
      ethers.utils.isAddress(upAddress) &&
      ethers.utils.isAddress(permissionsForm.addressTo)
    ) {
      data &&
        (await KeyManagerApi.addPermissions(
          upAddress,
          permissionsForm.addressTo,
          permissionsForm.permissions,
          data,
        ));
    }
  };

  return (
    <StyledAddPermissions>
      <StyledInputWrapper>
        <StyledLabel>Grant permission to Address: </StyledLabel>
        <StyledInput name="addressTo" onChange={changeHandler}></StyledInput>
      </StyledInputWrapper>
      <StyledPermissionInputWrapper>
        {Object.keys(permissionsForm.permissions).map((key) => (
          <StyledInputWrapper key={key}>
            <StyledCheckboxInput
              type="checkbox"
              name={key}
              id={key}
              value={key}
              onChange={changeHandler}
            ></StyledCheckboxInput>
            <StyledLabel htmlFor={key}>{key}</StyledLabel>
          </StyledInputWrapper>
        ))}
      </StyledPermissionInputWrapper>
      <StyledSetPermisssionButton onClick={setPermissions}>
        Set Permissions
      </StyledSetPermisssionButton>
    </StyledAddPermissions>
  );
};
