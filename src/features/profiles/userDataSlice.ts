import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { BigNumberish } from 'ethers';
import { NetworkName, RootState, ThunkExtra } from '../../boot/types';
import { API } from '../../services/api';
import { IProfile } from '../../services/models';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
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
  error: {
    fetchProfile: null,
    fetchAllProfiles: null,
    fetchOwnerOfProfile: null,
    fetchHolders: null,
    fetchCreators: null,
    fetchOwnerOfTokenId: null,
  },
  status: {
    fetchProfile: STATUS.IDLE,
    fetchAllProfiles: STATUS.IDLE,
    fetchOwnerOfProfile: STATUS.IDLE,
    fetchHolders: STATUS.IDLE,
    fetchCreators: STATUS.IDLE,
    fetchOwnerOfTokenId: STATUS.IDLE,
  },
});

/**
 * **************
 *     STATE
 * **************
 */

const initialState: IUserDataSliceState = {
  me: null,
  l16: usersAdapterInitialState,
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

// Helper function to fetch profiles
const fetchProfileByAddresses = async (
  addresses: Array<Address>,
  network: NetworkName,
  api: API,
  state: RootState,
) => {
  const currentEntities = Object.values(
    state.userData[network].entities,
  ) as Array<IProfile>;

  const existingAddresses = addresses.filter((address) =>
    currentEntities.find((e) => e.address === address),
  );

  const cardAddressesToFetch = addresses.filter(
    (address) => !existingAddresses.includes(address),
  );

  let res: Array<IProfile> = [];
  if (cardAddressesToFetch.length > 0) {
    res = await api.profiles.fetchAllProfiles(cardAddressesToFetch, network);
  }
  return [...Object.values(currentEntities), ...res] as IProfile[];
};

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
  { extra: ThunkExtra; state: RootState }
>(
  'userData/fetchHolder',
  async ({ address, network }, { extra: { api }, getState }) =>
    fetchProfileByAddresses(address, network, api, getState()),
);

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
  {
    addresses: string[];
    network: NetworkName;
  },
  { extra: ThunkExtra; state: RootState }
>(
  'userData/fetchAllProfiles',
  async ({ addresses, network }, { extra: { api }, getState }) =>
    fetchProfileByAddresses(addresses, network, api, getState()),
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
    resetUserDataSliceInitialState: (
      state,
      action: PayloadAction<NetworkName>,
    ) => {
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          error: {
            fetchProfile: null,
            fetchAllProfiles: null,
            fetchOwnerOfProfile: null,
            fetchHolders: null,
            fetchCreators: null,
          },
          status: {
            fetchProfile: STATUS.IDLE,
            fetchAllProfiles: STATUS.IDLE,
            fetchOwnerOfProfile: STATUS.IDLE,
            fetchHolders: STATUS.IDLE,
            fetchCreators: STATUS.IDLE,
          },
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileByAddress.pending, (state, action) => {
        state[action.meta.arg.network].status.fetchProfile = STATUS.LOADING;
      })
      .addCase(fetchProfileByAddress.fulfilled, (state, action) => {
        usersAdapter.upsertOne(
          state[action.meta.arg.network],
          action.payload as IProfile,
        );
        state[action.meta.arg.network].status.fetchProfile = STATUS.SUCCESSFUL;
      })
      .addCase(fetchProfileByAddress.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchProfile = action.error;
        state[action.meta.arg.network].status.fetchProfile = STATUS.FAILED;
      });
    builder
      .addCase(fetchOwnerOfTokenId.pending, (state, action) => {
        state[action.meta.arg.network].status.fetchOwnerOfProfile =
          STATUS.LOADING;
      })
      .addCase(fetchOwnerOfTokenId.fulfilled, (state, action) => {
        usersAdapter.upsertOne(
          state[action.meta.arg.network],
          action.payload as IProfile,
        );
        state[action.meta.arg.network].status.fetchOwnerOfProfile =
          STATUS.SUCCESSFUL;
      })
      .addCase(fetchOwnerOfTokenId.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchOwnerOfProfile = action.error;
        state[action.meta.arg.network].status.fetchOwnerOfProfile =
          STATUS.FAILED;
      });
    builder
      .addCase(fetchAssetHolders.pending, (state, action) => {
        state[action.meta.arg.network].status.fetchHolders = STATUS.LOADING;
      })
      .addCase(fetchAssetHolders.fulfilled, (state, action) => {
        usersAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as IProfile[],
        );
        state[action.meta.arg.network].status.fetchHolders = STATUS.SUCCESSFUL;
      })
      .addCase(fetchAssetHolders.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchHolders = action.error;
        state[action.meta.arg.network].status.fetchHolders = STATUS.FAILED;
      });
    builder
      .addCase(fetchAssetCreator.pending, (state, action) => {
        state[action.meta.arg.network].status.fetchCreators = STATUS.LOADING;
      })
      .addCase(fetchAssetCreator.fulfilled, (state, action) => {
        usersAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as IProfile[],
        );
        state[action.meta.arg.network].status.fetchCreators = STATUS.SUCCESSFUL;
      })
      .addCase(fetchAssetCreator.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchCreators = action.error;
        state[action.meta.arg.network].status.fetchCreators = STATUS.FAILED;
      });
    builder
      .addCase(fetchAllProfiles.pending, (state, action) => {
        state[action.meta.arg.network].status.fetchAllProfiles = STATUS.LOADING;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        usersAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as IProfile[],
        );
        state[action.meta.arg.network].status.fetchAllProfiles =
          STATUS.SUCCESSFUL;
      })
      .addCase(fetchAllProfiles.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchAllProfiles = action.error;
        state[action.meta.arg.network].status.fetchAllProfiles = STATUS.FAILED;
      });
    builder
      .addCase(fetchOwnerAddressOfTokenId.pending, (state, action) => {
        state.me = null;
        state[action.meta.arg.network].status.fetchOwnerOfTokenId =
          STATUS.LOADING;
      })
      .addCase(fetchOwnerAddressOfTokenId.fulfilled, (state, action) => {
        state.me = action.payload;
        state[action.meta.arg.network].status.fetchOwnerOfTokenId =
          STATUS.SUCCESSFUL;
      })
      .addCase(fetchOwnerAddressOfTokenId.rejected, (state, action) => {
        state.me = null;
        state[action.meta.arg.network].error.fetchOwnerOfTokenId = action.error;
        state[action.meta.arg.network].status.fetchOwnerOfTokenId =
          STATUS.FAILED;
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

export const { currentProfile, resetUserDataSliceInitialState } =
  userDataSlice.actions;
