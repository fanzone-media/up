import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { combineReducers } from 'redux';
import { cardsReducer } from '../features/cards';
import { userDataReducer } from '../features/profiles';
import { API } from '../services/api';
import Web3Service from '../services/Web3Service';

interface IStoreOptions {
  web3: Web3Service;
  api: API;
}

const rootReducer = combineReducers({
  userData: userDataReducer,
  cards: cardsReducer,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const buildStore = (options: IStoreOptions) => {
  const { web3, api } = options;

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { web3, api },
        },
      }),
    preloadedState: {},
    enhancers: [],
    devTools: process.env.NODE_ENV === 'development',
  });
  return store;
};

export type AppDispatch = ReturnType<typeof buildStore>['dispatch'];
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
