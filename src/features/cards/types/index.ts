import { EntityState, SerializedError } from '@reduxjs/toolkit';
import { ICard } from '../../../services/models';
import { STATUS } from '../../../utility';

interface IBaseState {
  status: {
    fetchCard: STATUS;
    fetchAllCards: STATUS;
    fetchIssuedCards: STATUS;
    fetchOwnedCards: STATUS;
    fetchMetaData: STATUS;
    fetchMarket: STATUS;
    fetchAuctionMarket: STATUS;
  };
  error: {
    fetchCard: Error | SerializedError | null;
    fetchAllCards: Error | SerializedError | null;
    fetchIssuedCards: Error | SerializedError | null;
    fetchOwnedCards: Error | SerializedError | null;
    fetchMetaData: Error | SerializedError | null;
    fetchMarket: Error | SerializedError | null;
    fetchAuctionMarket: Error | SerializedError | null;
  };
}
export type ICardItemsState = IBaseState;

export type ICardState = {
  l16: ICardItemsState & EntityState<ICard>;
  l14: ICardItemsState & EntityState<ICard>;
  polygon: ICardItemsState & EntityState<ICard>;
  mumbai: ICardItemsState & EntityState<ICard>;
  ethereum: ICardItemsState & EntityState<ICard>;
};
