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

export type NetworkName = 'l14' | 'mumbai' | 'polygon' | 'ethereum';

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export type UnpackedType<T> = T extends (infer U)[] ? U : T;

export enum StringBoolean {
  FALSE = '0',
  TRUE = '1',
}
