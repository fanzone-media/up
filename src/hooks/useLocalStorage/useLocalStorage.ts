import { NetworkName } from '../../boot/types';
import { IPermissionSet } from '../../services/models';
import { Address } from '../../utils/types';

export type ProfilePermissionsLocal = {
  [key in NetworkName]: {
    [key: string]: IPermissionSet[];
  };
};

export type ReferrerAddressLocal = {
  [key in NetworkName]: string;
};

export const LOCAL_STORAGE_KEYS = {
  UP: 'fanzone.universalProfiles',
  REFERRER: 'fanzone.referrerAddress',
};

export const useLocalStorage = () => {
  const setItem = (
    network: NetworkName,
    upAddress: Address,
    permissionSet: IPermissionSet[],
  ) => {
    const prevValue = getItems(
      LOCAL_STORAGE_KEYS.UP,
    ) as ProfilePermissionsLocal;
    const newValue = prevValue
      ? {
          ...prevValue,
          [`${network}`]: {
            ...prevValue[network],
            [`${upAddress.toLowerCase()}`]: permissionSet,
          },
        }
      : {
          [`${network}`]: {
            [`${upAddress.toLowerCase()}`]: permissionSet,
          },
        };
    localStorage.setItem(LOCAL_STORAGE_KEYS.UP, JSON.stringify(newValue));
  };

  const setReferrer = (network: NetworkName, referrerAddress: Address) => {
    const prevValue = getItems(
      LOCAL_STORAGE_KEYS.REFERRER,
    ) as ReferrerAddressLocal;
    const newValue = prevValue
      ? {
          ...prevValue,
          [`${network}`]: referrerAddress,
        }
      : {
          [`${network}`]: referrerAddress,
        };
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFERRER, JSON.stringify(newValue));
  };

  const getItems = (KeyName: string) => {
    const values = localStorage.getItem(KeyName);
    if (!values) return;

    if (KeyName === LOCAL_STORAGE_KEYS.UP) {
      const items = JSON.parse(values) as ProfilePermissionsLocal;
      return items;
    }
    if (KeyName === LOCAL_STORAGE_KEYS.REFERRER) {
      const items = JSON.parse(values) as ReferrerAddressLocal;
      return items;
    }
    return;
  };

  return { setItem, getItems, setReferrer };
};
