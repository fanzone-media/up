import { IPermissionSet } from '../services/models';
import { Address } from '../utils/types';

export const getAddressPermissionsOnUniversalProfile = (
  permissionSet: Array<IPermissionSet>,
  addressToCheck: Address,
): IPermissionSet | undefined =>
  permissionSet.find(
    (x) => x.address.toLowerCase() === addressToCheck.toLowerCase(),
  );
