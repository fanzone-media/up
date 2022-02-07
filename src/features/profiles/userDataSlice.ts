import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import { RootState, ThunkExtra } from '../../boot/types';
import { IProfile } from '../../services/models';
import { STATUS } from '../../utility';
import { IUserDataSliceState, IUsersState } from './types';

/**
 * **************
 *    ENTITIES
 * **************
 * We are using the createEntityAdapter since it provides us with pre-built functionality
 */
const usersAdapter = createEntityAdapter<IProfile>({
  selectId: (e) => e.address,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

/**
 * **************
 *     STATE
 * **************
 */
const initialState: IUserDataSliceState = {
  me: null,
  status: STATUS.IDLE,
  error: null,
  users: usersAdapter.getInitialState<IUsersState>({
    status: STATUS.IDLE,
    error: null,
  }),
};

/**
 * **************
 *     THUNKS
 * **************
 */

export const fetchProfileByAddress = createAsyncThunk<
  IProfile,
  string,
  { extra: ThunkExtra }
>('userData/fetchUserById', async (userAddress, { extra: { api } }) => {
  const profile = (await api.profiles.fetchProfile(
    userAddress,
  )) as IProfile;
  return profile;
});

export const fetchAllProfiles = createAsyncThunk<
  IProfile[],
  string[],
  { extra: ThunkExtra }
>('userData/fetchAllProfiles', async (userAddress, { extra: { api } }) => {
  const profile = (await api.profiles.fetchAllProfiles(
    userAddress,
  )) as IProfile[];

  return profile;
});

/**
 * **********************
 *    REDUCERS (SLICE)
 * **********************
 */
const userDataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    // Example
    anyEvent: {
      reducer(_state, _action) {
        // some mutation
      },
      prepare() {
        // do something before calling the reducer
        return {
          meta: undefined,
          error: null,
          payload: null,
        };
      },
    },
    // Example-End
  },
  extraReducers: (builder) => {
      builder
          .addCase(fetchProfileByAddress.pending, (state, _action) => {
              state.users.status = STATUS.LOADING;
          })
          .addCase(fetchProfileByAddress.fulfilled, (state, action) => {
              usersAdapter.upsertOne(state.users, action.payload as IProfile);
              state.users.status = STATUS.IDLE;
          })
          .addCase(fetchProfileByAddress.rejected, (state, action) => {
              state.users.error = action.error;
              state.users.status = STATUS.FAILED;
          });

    builder
      .addCase(fetchAllProfiles.pending, (state, _action) => {
        state.users.status = STATUS.LOADING;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        usersAdapter.upsertMany(state.users, action.payload);
        state.users.status = STATUS.IDLE;
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        state.users.error = action.error;
        state.users.status = STATUS.FAILED;
      });
  },
});

export const userDataReducer = userDataSlice.reducer;

/**
 * **************
 *    Selectors
 * **************
 */

export const {
  selectAll: selectAllUsersItems,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors<RootState>((state) => state.userData.users);

/**
 * ************
 *   ACTIONS
 * ************
 */

export const { anyEvent } = userDataSlice.actions;
