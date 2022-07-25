import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { ICard } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  ownedStatus: STATUS;
  issuedStatus: STATUS;
  ownedError: Error | SerializedError | null;
  issuedError: Error | SerializedError | null;
  status: STATUS;
  metaDataError: Error | SerializedError | null;
  metaDataStatus: STATUS;
  error: Error | SerializedError | null;
  marketsStatus: STATUS;
  marketsError: Error | SerializedError | null;
}
export type ICardItemsState = IBaseState;

export type ICardState = {
  l16: ICardItemsState & EntityState<ICard>;
  l14: ICardItemsState & EntityState<ICard>;
  polygon: ICardItemsState & EntityState<ICard>;
  mumbai: ICardItemsState & EntityState<ICard>;
  ethereum: ICardItemsState & EntityState<ICard>;
};
