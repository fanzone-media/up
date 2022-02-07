import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { IProfile } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  status: STATUS;
  holderStatus: STATUS;
  creatorStatus: STATUS;
  holderError: Error | SerializedError | null;
  creatorError: Error | SerializedError | null;
  error: Error | SerializedError | null;
}
export type IUsersState = IBaseState;

export type IUserDataSliceState = {
  users: IUsersState & EntityState<IProfile>;
};
