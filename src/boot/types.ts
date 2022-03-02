import { ICardState } from '../features/cards/types';
import { IUserDataSliceState } from '../features/profiles/types';
import { API } from '../services/api';

export type ThunkExtra = {
  api: API;
};

export type RootState = {
  userData: IUserDataSliceState;
  cards: ICardState;
};
