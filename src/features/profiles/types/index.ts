import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { ILSP3Profile, IUserAccount } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  status: STATUS;
  error: Error | SerializedError | null;
}
export type IUsersState = IBaseState;

export type IUserDataSliceState = {
  me: IUserAccount | null;
  status: STATUS;
  error: Error | SerializedError | null;
  users: IUsersState & EntityState<ILSP3Profile>;
};
