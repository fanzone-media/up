import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { ICard } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  ownedStatus: STATUS;
  issuedStatus: STATUS;
  ownedError: Error | SerializedError | null;
  issuedError: Error | SerializedError | null;
  status: STATUS;
  error: Error | SerializedError | null;
}
export type ICardItemsState = IBaseState;

export type ICardsSliceState = {
  issuedItems: ICardItemsState & EntityState<ICard>;
  ownedItems: ICardItemsState & EntityState<ICard>;
};

export type ICardState = ICardItemsState & EntityState<ICard>;
