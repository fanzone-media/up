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
  users: usersAdapter.getInitialState<IUsersState>({
    status: STATUS.IDLE,
    holderStatus: STATUS.IDLE,
    creatorStatus: STATUS.IDLE,
    error: null,
    holderError: null,
    creatorError: null,
  }),
};

/**
 * **************
 *     THUNKS
 * **************
 */

export const fetchProfileByAddress = createAsyncThunk<
  IProfile,
  { address: string; network: string },
  { extra: ThunkExtra }
>(
  'userData/fetchUserById',
  async ({ address, network }, { extra: { api } }) => {
    const profile = (await api.profiles.fetchProfile(
      address,
      network,
    )) as IProfile;
    return profile;
  },
);

export const fetchAssetHolders = createAsyncThunk<
  IProfile[],
  { address: string[]; network: string },
  { extra: ThunkExtra }
>('userData/fetchHolder', async ({ address, network }, { extra: { api } }) => {
  const profile = (await api.profiles.fetchAllProfiles(
    address,
    network,
  )) as IProfile[];
  return profile;
});

export const fetchAssetCreator = createAsyncThunk<
  IProfile[],
  { address: string[]; network: string },
  { extra: ThunkExtra }
>(
  'userData/fetchCreator ',
  async ({ address, network }, { extra: { api } }) => {
    const profile = (await api.profiles.fetchAllProfiles(
      address,
      network,
    )) as IProfile[];
    return profile;
  },
);

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
      .addCase(fetchAssetHolders.pending, (state, _action) => {
        state.users.holderStatus = STATUS.LOADING;
      })
      .addCase(fetchAssetHolders.fulfilled, (state, action) => {
        usersAdapter.upsertMany(state.users, action.payload as IProfile[]);
        state.users.holderStatus = STATUS.IDLE;
      })
      .addCase(fetchAssetHolders.rejected, (state, action) => {
        state.users.holderError = action.error;
        state.users.holderStatus = STATUS.FAILED;
      });
    builder
      .addCase(fetchAssetCreator.pending, (state, _action) => {
        state.users.creatorStatus = STATUS.LOADING;
      })
      .addCase(fetchAssetCreator.fulfilled, (state, action) => {
        usersAdapter.upsertMany(state.users, action.payload as IProfile[]);
        state.users.creatorStatus = STATUS.IDLE;
      })
      .addCase(fetchAssetCreator.rejected, (state, action) => {
        state.users.creatorError = action.error;
        state.users.creatorStatus = STATUS.FAILED;
      });
    builder
      .addCase(fetchAllProfiles.pending, (state, _action) => {
        state.users.status = STATUS.LOADING;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        usersAdapter.upsertMany(state.users, action.payload as IProfile[]);
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
