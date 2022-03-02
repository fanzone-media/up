import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { buildApi } from '../services/api';
import { buildStore } from './store';

interface IProps {
  children: ReactNode;
  buildApi: typeof buildApi;
}

/** buildStore moved to separate file to avoid circular dependency
 *  We want to import useAppDispatch in our source Code to have strict dispatch types
 */
export const ReduxProvider: React.FC<IProps> = ({
  buildApi,
  children,
}: IProps) => {
  const api = buildApi();

  const store = buildStore({ api });

  // The idea is to only replace individual reducers without reloading state (and dropping current state)
  // if (process.env.NODE_ENV === 'development' && module.hot) {
  //     module.hot.accept('src/features', () => store.replaceReducer(rootReducer));
  // }

  return <Provider store={store}>{children}</Provider>;
};
