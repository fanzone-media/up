import { IPermissionSet } from '../services/models';
import { Address } from '../utils/types';

export const getAddressPermissionsOnUniversalProfile = (
  permissionSet: Array<IPermissionSet>,
  addressToCheck: Address,
): IPermissionSet | undefined => {
  return permissionSet.find(
    (x) =>
      x.address.toLowerCase() === addressToCheck.toLowerCase() && x.permissions,
  );
};
