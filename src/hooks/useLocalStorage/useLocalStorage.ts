import { IPermissionSet } from '../../services/models';
import { Address } from '../../utils/types';

type Item = {
  [key: string]: IPermissionSet[];
};

export const useLocalStorage = () => {
  const KEY_NAME = 'fanzone.universalProfiles';

  const setItem = (upAddress: Address, permissionSet: IPermissionSet[]) => {
    const prevValue = getItems();
    const newValue = {
      ...prevValue,
      [`${upAddress.toLowerCase()}`]: permissionSet,
    };
    localStorage.setItem(KEY_NAME, JSON.stringify(newValue));
  };

  const getItems = () => {
    const values = localStorage.getItem(KEY_NAME);
    if (!values) return;
    return JSON.parse(values) as Item;
  };

  return { setItem, getItems };
};
