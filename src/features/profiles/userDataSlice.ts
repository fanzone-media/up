import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { BigNumberish } from 'ethers';
import { NetworkName, ThunkExtra } from '../../boot/types';
import { IProfile } from '../../services/models';
import { CONSTANTS, STATUS } from '../../utility';
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
  newError: {},
  newStatus: {},
});

/**
 * **************
 *     STATE
 * **************
 */

const initialState: IUserDataSliceState = {
  me: null,
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

const profileFetcherThunk = (thunkName: string) => {
  return createAsyncThunk<
    IProfile,
    { address: string; network: NetworkName },
    { extra: ThunkExtra }
  >(thunkName, async ({ address, network }, { extra: { api } }) => {
    const profile = (await api.profiles.fetchProfile(
      address,
      network,
    )) as IProfile;
    return profile;
  });
};

export const fetchProfileByAddress = profileFetcherThunk(
  'userData/fetchUserById',
);

export const fetchOwnerOfTokenId = profileFetcherThunk(
  'userData/fetchOwnerOfTokenId',
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

export const fetchOwnerAddressOfTokenId = createAsyncThunk<
  string,
  { assetAddress: string; tokenId: BigNumberish; network: NetworkName },
  { extra: ThunkExtra }
>(
  'userData/fetchOwnerAddressOfTokenId',
  async ({ assetAddress, tokenId, network }, { extra: { api } }) => {
    const ownerAddress = await api.cards.fetchOwnerOfTokenId(
      assetAddress,
      tokenId,
      network,
    );
    return ownerAddress;
  },
);

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
    currentProfile: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        me: action.payload,
      };
    },
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
      .addCase(fetchOwnerOfTokenId.pending, (state, action) => {
        state[action.meta.arg.network].newStatus = {
          [`${CONSTANTS.MINT_OWNER_STATUS}`]: STATUS.LOADING,
        };
      })
      .addCase(fetchOwnerOfTokenId.fulfilled, (state, action) => {
        usersAdapter.upsertOne(
          state[action.meta.arg.network],
          action.payload as IProfile,
        );
        state[action.meta.arg.network].newStatus = {
          [`${CONSTANTS.MINT_OWNER_STATUS}`]: STATUS.IDLE,
        };
      })
      .addCase(fetchOwnerOfTokenId.rejected, (state, action) => {
        state[action.meta.arg.network].error = {
          [`${CONSTANTS.MINT_OWNER_ERROR}`]: action.error,
        };
        state[action.meta.arg.network].newStatus = {
          [`${CONSTANTS.MINT_OWNER_STATUS}`]: STATUS.FAILED,
        };
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
    builder.addCase(fetchOwnerAddressOfTokenId.fulfilled, (state, action) => {
      state.me = action.payload;
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

export const { currentProfile } = userDataSlice.actions;
