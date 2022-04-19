import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { IProfile } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  me: string | null;
  status: STATUS;
  holderStatus: STATUS;
  creatorStatus: STATUS;
  holderError: Error | SerializedError | null;
  creatorError: Error | SerializedError | null;
  error: Error | SerializedError | null;
}
export type IUsersState = IBaseState;

export type IUserDataSliceState = {
  l14: IUsersState & EntityState<IProfile>;
  polygon: IUsersState & EntityState<IProfile>;
  mumbai: IUsersState & EntityState<IProfile>;
  ethereum: IUsersState & EntityState<IProfile>;
};
