import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import { NetworkName, ThunkExtra } from '../../boot/types';
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
});

const usersAdapterInitialState = usersAdapter.getInitialState<IUsersState>({
  status: STATUS.IDLE,
  holderStatus: STATUS.IDLE,
  creatorStatus: STATUS.IDLE,
  error: null,
  holderError: null,
  creatorError: null,
});

/**
 * **************
 *     STATE
 * **************
 */

const initialState: IUserDataSliceState = {
  l14: usersAdapterInitialState,
  polygon: usersAdapterInitialState,
  mumbai: usersAdapterInitialState,
  ethereum: usersAdapterInitialState,
};

/**
 * **************
 *     THUNKS
 * **************
 */

export const fetchProfileByAddress = createAsyncThunk<
  IProfile,
  { address: string; network: NetworkName },
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
  { address: string[]; network: NetworkName },
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
  { address: string[]; network: NetworkName },
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
  { addresses: string[]; network: NetworkName },
  { extra: ThunkExtra }
>(
  'userData/fetchAllProfiles',
  async ({ addresses, network }, { extra: { api } }) => {
    const profile = (await api.profiles.fetchAllProfiles(
      addresses,
      network,
    )) as IProfile[];

    return profile;
  },
);

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
      .addCase(fetchProfileByAddress.pending, (state, action) => {
        state[action.meta.arg.network].status = STATUS.LOADING;
      })
      .addCase(fetchProfileByAddress.fulfilled, (state, action) => {
        usersAdapter.upsertOne(
          state[action.meta.arg.network],
          action.payload as IProfile,
        );
        state[action.meta.arg.network].status = STATUS.IDLE;
      })
      .addCase(fetchProfileByAddress.rejected, (state, action) => {
        state[action.meta.arg.network].error = action.error;
        state[action.meta.arg.network].status = STATUS.FAILED;
      });
    builder
      .addCase(fetchAssetHolders.pending, (state, action) => {
        state[action.meta.arg.network].holderStatus = STATUS.LOADING;
      })
      .addCase(fetchAssetHolders.fulfilled, (state, action) => {
        usersAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as IProfile[],
        );
        state[action.meta.arg.network].holderStatus = STATUS.IDLE;
      })
      .addCase(fetchAssetHolders.rejected, (state, action) => {
        state[action.meta.arg.network].holderError = action.error;
        state[action.meta.arg.network].holderStatus = STATUS.FAILED;
      });
    builder
      .addCase(fetchAssetCreator.pending, (state, action) => {
        state[action.meta.arg.network].creatorStatus = STATUS.LOADING;
      })
      .addCase(fetchAssetCreator.fulfilled, (state, action) => {
        usersAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as IProfile[],
        );
        state[action.meta.arg.network].creatorStatus = STATUS.IDLE;
      })
      .addCase(fetchAssetCreator.rejected, (state, action) => {
        state[action.meta.arg.network].creatorError = action.error;
        state[action.meta.arg.network].creatorStatus = STATUS.FAILED;
      });
    builder
      .addCase(fetchAllProfiles.pending, (state, action) => {
        state[action.meta.arg.network].status = STATUS.LOADING;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        usersAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as IProfile[],
        );
        state[action.meta.arg.network].status = STATUS.IDLE;
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        state[action.meta.arg.network].error = action.error;
        state[action.meta.arg.network].status = STATUS.FAILED;
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
} = usersAdapter.getSelectors();

/**
 * ************
 *   ACTIONS
 * ************
 */

export const { anyEvent } = userDataSlice.actions;
