import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { BigNumberish } from 'ethers';
import { NetworkName, RootState, ThunkExtra } from '../../boot/types';
import { API } from '../../services/api';
import { ICard, SupportedInterface } from '../../services/models';
import { STATUS } from '../../utility';
import { Address } from '../../utils/types';
import { ICardItemsState, ICardState } from './types';

/**
 * **************
 *    ENTITIES
 * **************
 * We are using the createEntityAdapter since it provides us with pre-built functionality
 */
const cardsAdapter = createEntityAdapter<ICard>({
  selectId: (e) => e.address,
});

const cardAdapterInitialState = cardsAdapter.getInitialState<ICardItemsState>({
  status: {
    fetchCard: STATUS.IDLE,
    fetchAllCards: STATUS.IDLE,
    fetchIssuedCards: STATUS.IDLE,
    fetchOwnedCards: STATUS.IDLE,
    fetchMetaData: STATUS.IDLE,
    fetchMarket: STATUS.IDLE,
    fetchAuctionMarket: STATUS.IDLE,
  },
  error: {
    fetchCard: null,
    fetchAllCards: null,
    fetchIssuedCards: null,
    fetchOwnedCards: null,
    fetchMetaData: null,
    fetchMarket: null,
    fetchAuctionMarket: null,
  },
});

/**
 * **************
 *     STATE
 * **************
 */
const initialState: ICardState = {
  l16: cardAdapterInitialState,
  l14: cardAdapterInitialState,
  polygon: cardAdapterInitialState,
  mumbai: cardAdapterInitialState,
  ethereum: cardAdapterInitialState,
};

/**
 * **************
 *     THUNKS
 * **************
 */

// Helper function to fetch cards
const fetchCardsByAddresses = async (
  addresses: Array<Address>,
  network: NetworkName,
  api: API,
  state: RootState,
) => {
  const currentEntities = Object.values(
    state.cards[network].entities,
  ) as Array<ICard>;

  const existingAddresses = addresses.filter((address) =>
    currentEntities.find((e) => e.address === address),
  );

  const cardAddressesToFetch = addresses.filter(
    (address) => !existingAddresses.includes(address),
  );

  let res: Array<ICard> = [];
  if (cardAddressesToFetch.length > 0) {
    res = await api.cards.fetchAllCards(network, cardAddressesToFetch);
  }
  return [...Object.values(currentEntities), ...res] as ICard[];
};

export const fetchAllCards = createAsyncThunk<
  ICard[],
  {
    network: NetworkName;
    addresses: Address[];
  },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchAllCards',
  async ({ network, addresses }, { getState, extra: { api } }) =>
    fetchCardsByAddresses(addresses, network, api, getState()),
);

export const fetchCard = createAsyncThunk<
  ICard,
  { network: NetworkName; address: string; tokenId?: BigNumberish },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchCard',
  async ({ address, network, tokenId }, { extra: { api } }) => {
    const res = await api.cards.fetchCard(address, network, tokenId);
    return res as ICard;
  },
);

export const fetchIssuedCards = createAsyncThunk<
  ICard[],
  { network: NetworkName; addresses: Address[] },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchIssuedCards',
  async ({ network, addresses }, { getState, extra: { api } }) =>
    fetchCardsByAddresses(addresses, network, api, getState()),
);

export const fetchOwnedCards = createAsyncThunk<
  ICard[],
  { network: NetworkName; addresses: Address[] },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchOwnedCards',
  async ({ network, addresses }, { getState, extra: { api } }) =>
    fetchCardsByAddresses(addresses, network, api, getState()),
);

export const fetchMetaDataForTokenId = createAsyncThunk<
  ICard,
  {
    assetAddress: string;
    tokenId: BigNumberish;
    network: NetworkName;
    supportedInterface: SupportedInterface;
  },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchMetaDataForTokenId',
  async (
    { assetAddress, tokenId, network, supportedInterface },
    { extra: { api }, getState },
  ) => {
    const res = await api.cards.fetchMetaDataForTokenID(
      assetAddress,
      tokenId,
      network,
      supportedInterface,
    );
    const state: RootState = getState();
    return {
      ...state.cards[network].entities[assetAddress],
      lsp8MetaData: {
        ...state.cards[network].entities[assetAddress]?.lsp8MetaData,
        [`${tokenId}`]: res,
      },
    } as ICard;
  },
);

export const fetchAllMarkets = createAsyncThunk<
  ICard,
  { assetAddress: string; network: NetworkName },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchAllMarkets',
  async ({ assetAddress, network }, { extra: { api }, getState }) => {
    const res = await api.cards.fetchAllMarkets(assetAddress, network);
    const state: RootState = getState();
    return {
      ...state.cards[network].entities[assetAddress],
      market: res,
    } as ICard;
  },
);

export const fetchAuctionMarket = createAsyncThunk<
  ICard,
  { assetAddress: string; network: NetworkName },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchAuctionMarket',
  async ({ assetAddress, network }, { extra: { api }, getState }) => {
    const res = await api.auctions.fetchAllAuctionFor(assetAddress, network);
    const state: RootState = getState();
    return {
      ...state.cards[network].entities[assetAddress],
      auctionMarket: res,
    } as ICard;
  },
);

/**
 * **********************
 *    REDUCERS (SLICE)
 * **********************
 */
const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    resetCardsSliceInitialState: (
      state,
      action: PayloadAction<NetworkName>,
    ) => {
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          status: {
            fetchCard: STATUS.IDLE,
            fetchAllCards: STATUS.IDLE,
            fetchIssuedCards: STATUS.IDLE,
            fetchOwnedCards: STATUS.IDLE,
            fetchMetaData: STATUS.IDLE,
            fetchMarket: STATUS.IDLE,
            fetchAuctionMarket: STATUS.IDLE,
          },
          error: {
            fetchCard: null,
            fetchAllCards: null,
            fetchIssuedCards: null,
            fetchOwnedCards: null,
            fetchMetaData: null,
            fetchMarket: null,
            fetchAuctionMarket: null,
          },
        },
      };
    },
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
      .addCase(fetchAllCards.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchAllCards = STATUS.LOADING;
      })
      .addCase(fetchAllCards.fulfilled, (state, action) => {
        cardsAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as ICard[],
        );
        state[action.meta.arg.network].status.fetchAllCards = STATUS.SUCCESSFUL;
      })
      .addCase(fetchAllCards.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchAllCards = action.error;
        state[action.meta.arg.network].status.fetchAllCards = STATUS.FAILED;
      });
    builder
      .addCase(fetchIssuedCards.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchIssuedCards =
          STATUS.LOADING;
      })
      .addCase(fetchIssuedCards.fulfilled, (state, action) => {
        cardsAdapter.upsertMany(
          state[action.meta.arg.network],
          action.payload as ICard[],
        );
        state[action.meta.arg.network].status.fetchIssuedCards =
          STATUS.SUCCESSFUL;
      })
      .addCase(fetchIssuedCards.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchIssuedCards = action.error;
        state[action.meta.arg.network].status.fetchIssuedCards = STATUS.FAILED;
      });
    builder
      .addCase(fetchCard.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchCard = STATUS.LOADING;
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertOne(
            state[action.meta.arg.network],
            action.payload as ICard,
          );
        state[action.meta.arg.network].status.fetchCard = STATUS.SUCCESSFUL;
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchCard = action.error;
        state[action.meta.arg.network].status.fetchCard = STATUS.FAILED;
      });
    builder
      .addCase(fetchOwnedCards.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchOwnedCards = STATUS.LOADING;
      })
      .addCase(fetchOwnedCards.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertMany(
            state[action.meta.arg.network],
            action.payload as ICard[],
          );
        state[action.meta.arg.network].status.fetchOwnedCards =
          STATUS.SUCCESSFUL;
      })
      .addCase(fetchOwnedCards.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchOwnedCards = action.error;
        state[action.meta.arg.network].status.fetchOwnedCards = STATUS.FAILED;
      });
    builder
      .addCase(fetchMetaDataForTokenId.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchMetaData = STATUS.LOADING;
      })
      .addCase(fetchMetaDataForTokenId.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertOne(
            state[action.meta.arg.network],
            action.payload as ICard,
          );
        state[action.meta.arg.network].status.fetchMetaData = STATUS.SUCCESSFUL;
      })
      .addCase(fetchMetaDataForTokenId.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchMetaData = action.error;
        state[action.meta.arg.network].status.fetchMetaData = STATUS.FAILED;
      });
    builder
      .addCase(fetchAllMarkets.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchMarket = STATUS.LOADING;
      })
      .addCase(fetchAllMarkets.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertOne(
            state[action.meta.arg.network],
            action.payload as ICard,
          );
        state[action.meta.arg.network].status.fetchMarket = STATUS.SUCCESSFUL;
      })
      .addCase(fetchAllMarkets.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchMarket = action.error;
        state[action.meta.arg.network].status.fetchMarket = STATUS.FAILED;
      });
    builder
      .addCase(fetchAuctionMarket.pending, (state, _action) => {
        state[_action.meta.arg.network].status.fetchAuctionMarket =
          STATUS.LOADING;
      })
      .addCase(fetchAuctionMarket.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertOne(
            state[action.meta.arg.network],
            action.payload as ICard,
          );
        state[action.meta.arg.network].status.fetchAuctionMarket =
          STATUS.SUCCESSFUL;
      })
      .addCase(fetchAuctionMarket.rejected, (state, action) => {
        state[action.meta.arg.network].error.fetchAuctionMarket = action.error;
        state[action.meta.arg.network].status.fetchAuctionMarket =
          STATUS.FAILED;
      });
  },
});

export const cardsReducer = cardsSlice.reducer;

/**
 * **************
 *    Selectors
 * **************
 */

export const {
  selectAll: selectAllCardItems,
  selectById: selectCardById,
  selectIds: selectCardIds,
  selectEntities: selectCardEntities,
} = cardsAdapter.getSelectors();

/**
 * ************
 *   ACTIONS
 * ************
 */

export const { anyEvent, resetCardsSliceInitialState } = cardsSlice.actions;
