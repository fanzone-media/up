import { ethers, Signer } from 'ethers';
import React, { useMemo, useState } from 'react';
import { useSigner } from 'wagmi';
import { NetworkName, StringBoolean } from '../../../boot/types';
import { useProfile } from '../../../hooks';
import { KeyManagerApi } from '../../../services/controllers/KeyManager';
import { IPermissionSet, IProfile } from '../../../services/models';
import { getAddressPermissionsOnUniversalProfile } from '../../../utility/permissions';
import {
  StyledAddPermissions,
  StyledInputWrapper,
  StyledInput,
  StyledLabel,
  StyledPermissionInputWrapper,
  StyledCheckboxInput,
  StyledSetPermisssionButton,
} from './styles';

interface IProps {
  profile?: IProfile;
  network: NetworkName;
}

type formInput = {
  upAddress: string;
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

export const AddPermissionsModalContent = ({ profile, network }: IProps) => {
  const { data: signer } = useSigner();
  const [permissionsForm, setpermissionsForm] = useState<formInput>({
    upAddress: profile ? profile.address : '',
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

  const [
    destinationProfile,
    profileAddressError,
    getProfile,
    isProfileLoading,
  ] = useProfile();

  const currentPermissions = useMemo(() => {
    const res = getAddressPermissionsOnUniversalProfile(
      profile
        ? profile.permissionSet
        : destinationProfile
        ? destinationProfile.permissionSet
        : [],
      permissionsForm.addressTo,
    );

    const keys =
      res &&
      (Object.keys(res.permissions) as Array<
        keyof IPermissionSet['permissions']
      >);

    const permissions =
      res &&
      keys &&
      (Object.fromEntries(
        keys.map((key) => [
          key.toUpperCase(),
          res.permissions[key] === StringBoolean.TRUE,
        ]),
      ) as formInput['permissions']);

    permissions &&
      setpermissionsForm({
        ...permissionsForm,
        permissions,
      });

    return permissions;
  }, [destinationProfile, permissionsForm.addressTo, profile]);

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
      ethers.utils.isAddress(permissionsForm.upAddress) &&
      ethers.utils.isAddress(permissionsForm.addressTo)
    ) {
      signer &&
        (await KeyManagerApi.addPermissions(
          permissionsForm.upAddress,
          permissionsForm.addressTo,
          permissionsForm.permissions,
          signer as Signer,
        ));
    }
  };

  useMemo(() => {
    if (!profile && permissionsForm.upAddress) {
      getProfile(permissionsForm.upAddress, network);
    }
  }, [getProfile, network, permissionsForm.upAddress, profile]);

  return (
    <StyledAddPermissions>
      {!profile && (
        <StyledInputWrapper>
          <StyledLabel>Up Address: </StyledLabel>
          <StyledInput name="upAddress" onChange={changeHandler}></StyledInput>
        </StyledInputWrapper>
      )}
      <StyledInputWrapper>
        <StyledLabel>Grant permission to Address: </StyledLabel>
        <StyledInput name="addressTo" onChange={changeHandler}></StyledInput>
      </StyledInputWrapper>
      <StyledPermissionInputWrapper>
        {(
          Object.keys(permissionsForm.permissions) as Array<
            keyof formInput['permissions']
          >
        ).map((key, i) => (
          <StyledInputWrapper key={permissionsForm.addressTo + '_' + i}>
            <StyledCheckboxInput
              type="checkbox"
              name={key}
              id={key}
              value={key}
              defaultChecked={
                currentPermissions ? currentPermissions[key] : false
              }
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
