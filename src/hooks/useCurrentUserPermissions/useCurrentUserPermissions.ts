import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAccount } from 'wagmi';
import { RootState } from '../../boot/types';
import { selectUserById } from '../../features/profiles';
import { IPermissionSet } from '../../services/models';
import { getAddressPermissionsOnUniversalProfile } from '../../utility/permissions';
import { Address } from '../../utils/types';
import { useUrlParams } from '../useUrlParams';

export const useCurrentUserPermissions = (profileAddress: Address | null) => {
  const defaultPermissions = useMemo(
    () => ({
      sign: '0',
      transfervalue: '0',
      deploy: '0',
      delegatecall: '0',
      staticcall: '0',
      call: '0',
      setdata: '0',
      addpermissions: '0',
      changepermissions: '0',
      changeowner: '0',
    }),
    [],
  );

  const { network } = useUrlParams();
  const { address: account } = useAccount();
  const activeProfile = useSelector(
    (state: RootState) =>
      profileAddress && selectUserById(state.userData[network], profileAddress),
  );

  const [currentUsersPermissionsSet, setCurrentUsersPermissionsSet] =
    useState<IPermissionSet['permissions']>(defaultPermissions);

  useEffect(() => {
    if (!activeProfile || !account) {
      setCurrentUsersPermissionsSet(defaultPermissions);
      return;
    }

    const _currentUsersPermissionsSet = getAddressPermissionsOnUniversalProfile(
      activeProfile.permissionSet,
      account,
    );

    _currentUsersPermissionsSet !== undefined
      ? setCurrentUsersPermissionsSet(_currentUsersPermissionsSet.permissions)
      : setCurrentUsersPermissionsSet(defaultPermissions);
  }, [account, activeProfile, defaultPermissions]);

  return currentUsersPermissionsSet;
};
