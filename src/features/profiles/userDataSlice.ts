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
});

/**
 * **************
 *     STATE
 * **************
 */
const initialState: IUserDataSliceState = {
  l14: usersAdapter.getInitialState<IUsersState>({
    status: STATUS.IDLE,
    holderStatus: STATUS.IDLE,
    creatorStatus: STATUS.IDLE,
    error: null,
    holderError: null,
    creatorError: null,
  }),
  polygon: usersAdapter.getInitialState<IUsersState>({
    status: STATUS.IDLE,
    holderStatus: STATUS.IDLE,
    creatorStatus: STATUS.IDLE,
    error: null,
    holderError: null,
    creatorError: null,
  }),
  mumbai: usersAdapter.getInitialState<IUsersState>({
    status: STATUS.IDLE,
    holderStatus: STATUS.IDLE,
    creatorStatus: STATUS.IDLE,
    error: null,
    holderError: null,
    creatorError: null,
  }),
  ethereum: usersAdapter.getInitialState<IUsersState>({
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
  {addresses: string[], network: string},
  { extra: ThunkExtra }
>('userData/fetchAllProfiles', async ({addresses, network}, { extra: { api } }) => {
  const profile = (await api.profiles.fetchAllProfiles(
    addresses,
    network
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
        switch (_action.meta.arg.network) {
          case 'l14':
            state.l14.status = STATUS.LOADING;
            break;
          case 'polygon':
            state.polygon.status = STATUS.LOADING;
            break;
          case 'mumbai':
            state.mumbai.status = STATUS.LOADING;
            break;
          case 'ethereum':
            state.ethereum.status = STATUS.LOADING;
            break;
        }
      })
      .addCase(fetchProfileByAddress.fulfilled, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            usersAdapter.upsertOne(state.l14, action.payload as IProfile);
            state.l14.status = STATUS.IDLE;
            break;
          case 'polygon':
            usersAdapter.upsertOne(state.polygon, action.payload as IProfile);
            state.polygon.status = STATUS.IDLE;
            break;
          case 'mumbai':
            usersAdapter.upsertOne(state.mumbai, action.payload as IProfile);
            state.mumbai.status = STATUS.IDLE;
            break;
          case 'ethereum':
            usersAdapter.upsertOne(state.ethereum, action.payload as IProfile);
            state.ethereum.status = STATUS.IDLE;
            break;
        }
      })
      .addCase(fetchProfileByAddress.rejected, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            state.l14.error = action.error;
            state.l14.status = STATUS.FAILED;
            break;
          case 'polygon':
            state.polygon.error = action.error;
            state.polygon.status = STATUS.FAILED;
            break;
          case 'mumbai':
            state.mumbai.error = action.error;
            state.mumbai.status = STATUS.FAILED;
            break;
          case 'ethereum':
            state.ethereum.error = action.error;
            state.ethereum.status = STATUS.FAILED;
            break;
        }
      });
    builder
      .addCase(fetchAssetHolders.pending, (state, _action) => {
        switch (_action.meta.arg.network) {
          case 'l14':
            state.l14.holderStatus = STATUS.LOADING;
            break;
          case 'polygon':
            state.polygon.holderStatus = STATUS.LOADING;
            break;
          case 'mumbai':
            state.mumbai.holderStatus = STATUS.LOADING;
            break;
          case 'ethereum':
            state.ethereum.holderStatus = STATUS.LOADING;
            break;
        }
      })
      .addCase(fetchAssetHolders.fulfilled, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            usersAdapter.upsertMany(state.l14, action.payload as IProfile[]);
            state.l14.holderStatus = STATUS.IDLE;
            break;
          case 'polygon':
            usersAdapter.upsertMany(state.polygon, action.payload as IProfile[]);
            state.l14.holderStatus = STATUS.IDLE;
            break;
          case 'mumbai':
            usersAdapter.upsertMany(state.mumbai, action.payload as IProfile[]);
            state.l14.holderStatus = STATUS.IDLE;
            break;
          case 'ethereum':
            usersAdapter.upsertMany(state.ethereum, action.payload as IProfile[]);
            state.l14.holderStatus = STATUS.IDLE;
            break;
        }
      })
      .addCase(fetchAssetHolders.rejected, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            state.l14.holderError = action.error;
            state.l14.holderStatus = STATUS.FAILED;
            break;
          case 'polygon':
            state.polygon.holderError = action.error;
            state.polygon.holderStatus = STATUS.FAILED;
            break;
          case 'mumbai':
            state.mumbai.holderError = action.error;
            state.mumbai.holderStatus = STATUS.FAILED;
            break;
          case 'ethereum':
            state.ethereum.holderError = action.error;
            state.ethereum.holderStatus = STATUS.FAILED;
            break;
        }
      });
    builder
      .addCase(fetchAssetCreator.pending, (state, _action) => {
        switch (_action.meta.arg.network) {
          case 'l14':
            state.l14.creatorStatus = STATUS.LOADING;
            break;
          case 'polygon':
            state.polygon.creatorStatus = STATUS.LOADING;
            break;
          case 'mumbai':
            state.mumbai.creatorStatus = STATUS.LOADING;
            break;
          case 'ethereum':
            state.ethereum.creatorStatus = STATUS.LOADING;
            break;
        }
      })
      .addCase(fetchAssetCreator.fulfilled, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            usersAdapter.upsertMany(state.l14, action.payload as IProfile[]);
            state.l14.creatorStatus = STATUS.IDLE;
            break;
          case 'polygon':
            usersAdapter.upsertMany(state.polygon, action.payload as IProfile[]);
            state.polygon.creatorStatus = STATUS.IDLE;
            break;
          case 'mumbai':
            usersAdapter.upsertMany(state.mumbai, action.payload as IProfile[]);
            state.mumbai.creatorStatus = STATUS.IDLE;
            break;
          case 'ethereum':
            usersAdapter.upsertMany(state.ethereum, action.payload as IProfile[]);
            state.ethereum.creatorStatus = STATUS.IDLE;
            break;
        }
      })
      .addCase(fetchAssetCreator.rejected, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            state.l14.creatorError = action.error;
            state.l14.creatorStatus = STATUS.FAILED;
            break;
          case 'polygon':
            state.polygon.creatorError = action.error;
            state.polygon.creatorStatus = STATUS.FAILED;
            break;
          case 'mumbai':
            state.mumbai.creatorError = action.error;
            state.mumbai.creatorStatus = STATUS.FAILED;
            break;
          case 'ethereum':
            state.ethereum.creatorError = action.error;
            state.ethereum.creatorStatus = STATUS.FAILED;
            break;
        }
      });
    builder
      .addCase(fetchAllProfiles.pending, (state, _action) => {
        switch (_action.meta.arg.network) {
          case 'l14':
            state.l14.status = STATUS.LOADING;
            break;
          case 'polygon':
            state.polygon.status = STATUS.LOADING;
            break;
          case 'mumbai':
            state.mumbai.status = STATUS.LOADING;
            break;
          case 'ethereum':
            state.ethereum.status = STATUS.LOADING;
            break;
        }
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            usersAdapter.upsertMany(state.l14, action.payload as IProfile[]);
            state.l14.status = STATUS.IDLE;
            break;
          case 'polygon':
            usersAdapter.upsertMany(state.polygon, action.payload as IProfile[]);
            state.polygon.status = STATUS.IDLE;
            break;
          case 'mumbai':
            usersAdapter.upsertMany(state.mumbai, action.payload as IProfile[]);
            state.mumbai.status = STATUS.IDLE;
            break;
          case 'ethereum':
            usersAdapter.upsertMany(state.ethereum, action.payload as IProfile[]);
            state.ethereum.status = STATUS.IDLE;
            break;
        }
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        switch (action.meta.arg.network) {
          case 'l14':
            state.l14.error = action.error;
            state.l14.status = STATUS.FAILED;
            break;
          case 'polygon':
            state.polygon.error = action.error;
            state.polygon.status = STATUS.FAILED;
            break;
          case 'mumbai':
            state.mumbai.error = action.error;
            state.mumbai.status = STATUS.FAILED;
            break;
          case 'ethereum':
            state.ethereum.error = action.error;
            state.ethereum.status = STATUS.FAILED;
            break;
        }
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
  selectAll: selectAllL14UsersItems,
  selectById: selectL14UserById,
  selectIds: selectL14UserIds,
} = usersAdapter.getSelectors<RootState>((state) => state.userData.l14);

export const {
  selectAll: selectAllPolygonUsersItems,
  selectById: selectPolygonUserById,
  selectIds: selectPolygonUserIds,
} = usersAdapter.getSelectors<RootState>((state) => state.userData.polygon);

export const {
  selectAll: selectAllMumbaiUsersItems,
  selectById: selectMumbaiUserById,
  selectIds: selectMumbaiUserIds,
} = usersAdapter.getSelectors<RootState>((state) => state.userData.mumbai);

export const {
  selectAll: selectAllEthereumUsersItems,
  selectById: selectEthereumUserById,
  selectIds: selectEthereumUserIds,
} = usersAdapter.getSelectors<RootState>((state) => state.userData.ethereum);

/**
 * ************
 *   ACTIONS
 * ************
 */

export const { anyEvent } = userDataSlice.actions;
