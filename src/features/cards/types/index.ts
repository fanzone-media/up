import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { ILSP4Card } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  status: STATUS;
  error: Error | SerializedError | null;
}
export type ICardItemsState = IBaseState;

export type ICardsSliceState = {
  issuedItems: ICardItemsState & EntityState<ILSP4Card>;
  ownedItems: ICardItemsState & EntityState<ILSP4Card>;
};
