import { ICardState } from '../features/cards/types';
import { IUserDataSliceState } from '../features/profiles/types';
import { API } from '../services/api';
import Web3Service from '../services/Web3Service';

export type ThunkExtra = {
  web3: Web3Service;
  api: API;
};

export type RootState = {
  userData: IUserDataSliceState;
  cards: ICardState;
};
