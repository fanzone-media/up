import { NetworkName } from '../../boot/types';
import { IPermissionSet } from '../../services/models';
import { Address } from '../../utils/types';

type Item = {
  [key in NetworkName]: {
    [key: string]: IPermissionSet[];
  };
};

export const useLocalStorage = () => {
  const KEY_NAME = 'fanzone.universalProfiles';

  const setItem = (
    network: NetworkName,
    upAddress: Address,
    permissionSet: IPermissionSet[],
  ) => {
    const prevValue = getItems(network);
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
    localStorage.setItem(KEY_NAME, JSON.stringify(newValue));
  };

  const getItems = (network?: NetworkName) => {
    const values = localStorage.getItem(KEY_NAME);
    if (!values) return;
    const items = JSON.parse(values) as Item;
    return network ? items[network] : items;
  };

  return { setItem, getItems };
};
