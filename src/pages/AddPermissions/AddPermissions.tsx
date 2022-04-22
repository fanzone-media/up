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

type formInput = {
  universalProfileAddress: string;
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

export const AddPermissions: React.FC = () => {
  const [{ data }] = useSigner();
  const [{ data: networkData }] = useNetwork();
  const [permissionsForm, setpermissionsForm] = useState<formInput>({
    universalProfileAddress: '',
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
      ethers.utils.isAddress(permissionsForm.universalProfileAddress) &&
      ethers.utils.isAddress(permissionsForm.addressTo)
    ) {
      data &&
        (await KeyManagerApi.addPermissions(
          permissionsForm.universalProfileAddress,
          permissionsForm.addressTo,
          permissionsForm.permissions,
          data,
        ));
    }
  };

  return (
    <StyledAddPermissions>
      <StyledNetworkLabel>
        You are connected to {networkData.chain?.name} network
      </StyledNetworkLabel>
      <StyledInputWrapper>
        <StyledLabel>Universal Profile Address: </StyledLabel>
        <StyledInput
          name="universalProfileAddress"
          onChange={changeHandler}
        ></StyledInput>
      </StyledInputWrapper>
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
              value={key}
              onChange={changeHandler}
            ></StyledCheckboxInput>
            <StyledLabel>{key}</StyledLabel>
          </StyledInputWrapper>
        ))}
      </StyledPermissionInputWrapper>
      <StyledSetPermisssionButton onClick={setPermissions}>
        Set Permissions
      </StyledSetPermisssionButton>
    </StyledAddPermissions>
  );
};
