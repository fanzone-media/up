import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { IProfile } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  error: {
    fetchProfile: Error | SerializedError | null;
    fetchAllProfiles: Error | SerializedError | null;
    fetchOwnerOfProfile: Error | SerializedError | null;
    fetchHolders: Error | SerializedError | null;
    fetchCreators: Error | SerializedError | null;
    fetchOwnerOfTokenId: Error | SerializedError | null;
    fetchIssuedAssetAddresses: Error | SerializedError | null;
    fetchOwnedAssetsAddresses: Error | SerializedError | null;
  };
  status: {
    fetchProfile: STATUS;
    fetchAllProfiles: STATUS;
    fetchOwnerOfProfile: STATUS;
    fetchHolders: STATUS;
    fetchCreators: STATUS;
    fetchOwnerOfTokenId: STATUS;
    fetchIssuedAssetAddresses: STATUS;
    fetchOwnedAssetsAddresses: STATUS;
  };
}
export type IUsersState = IBaseState;

export type IUserDataSliceState = {
  me: string | null;
  l16: IUsersState & EntityState<IProfile>;
  l14: IUsersState & EntityState<IProfile>;
  polygon: IUsersState & EntityState<IProfile>;
  mumbai: IUsersState & EntityState<IProfile>;
  ethereum: IUsersState & EntityState<IProfile>;
};
