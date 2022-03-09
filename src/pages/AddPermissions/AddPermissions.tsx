import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useSigner } from 'wagmi';
import { KeyManagerApi } from '../../services/controllers/KeyManager';
import { StyledAddPermissions, StyledInputWrappar, StyledInput, StyledLabel, StyledPermissionInputWrappar, StyledCheckboxInput, StyledSetPermisssionButton } from './styles';

type formInput = {
    universalProfileAddress: string;
    addressTo: string;
    permissions: {
        CHANGEOWNER: boolean,
        CHANGEPERMISSIONS: boolean,
        ADDPERMISSIONS: boolean,
        SETDATA: boolean,
        CALL: boolean,
        STATICCALL: boolean,
        DELEGATECALL: boolean,
        DEPLOY: boolean,
        TRANSFERVALUE: boolean,
        SIGN: boolean
    }
};

export const AddPermissions: React.FC = () => {

    const [{ data, error, loading }, getSigner] = useSigner();
    const [permissionsForm, setpermissionsForm] = useState<formInput>({
        universalProfileAddress: '',
        addressTo: '',
        permissions: {
            CHANGEOWNER: false,
            CHANGEPERMISSIONS: false,
            ADDPERMISSIONS: false,
            SETDATA: true,
            CALL: true,
            STATICCALL: false,
            DELEGATECALL: false,
            DEPLOY: false,
            TRANSFERVALUE: false,
            SIGN: false
        }
      });

    const changeHandler = (
        event: React.ChangeEvent<HTMLInputElement>,
        ) => {

        if(event.currentTarget.type === "checkbox") {
            event.currentTarget.checked ? 
                setpermissionsForm({
                    ...permissionsForm,
                    permissions: {
                        ...permissionsForm.permissions,
                        [event.currentTarget.name] : true
                    }
                })
            :
                setpermissionsForm({
                    ...permissionsForm,
                    permissions: {
                        ...permissionsForm.permissions,
                        [event.currentTarget.name] : false
                    }
                })
            
        } else {
            setpermissionsForm({
                ...permissionsForm,
                [event.currentTarget.name]: event.currentTarget.value,
            });
        }
    };

    const setPermissions = async () => {
        if(ethers.utils.isAddress(permissionsForm.universalProfileAddress) && ethers.utils.isAddress(permissionsForm.addressTo)) {
            data && await KeyManagerApi.addPermissions(
                permissionsForm.universalProfileAddress, 
                permissionsForm.addressTo, 
                permissionsForm.permissions,
                data
            );
        }
    };

    return (
        <StyledAddPermissions>
            <StyledInputWrappar>
                <StyledLabel>Universal Profile Address: </StyledLabel>
                <StyledInput name='universalProfileAddress' onChange={changeHandler}></StyledInput>
            </StyledInputWrappar>
            <StyledInputWrappar>
                <StyledLabel>Grant permission to Address: </StyledLabel>
                <StyledInput name='addressTo' onChange={changeHandler}></StyledInput>
            </StyledInputWrappar>
            <StyledPermissionInputWrappar>
            {
                Object.keys(permissionsForm.permissions).map((key) => 
                    <StyledInputWrappar key={key}>
                        <StyledCheckboxInput type='checkbox' name={key} value={key} onChange={changeHandler} ></StyledCheckboxInput>
                        <StyledLabel>{key}</StyledLabel>
                    </StyledInputWrappar>
                )
            }
            </StyledPermissionInputWrappar>    
            <StyledSetPermisssionButton onClick={setPermissions}>Set Permissions</StyledSetPermisssionButton>     
        </StyledAddPermissions>
    );
};