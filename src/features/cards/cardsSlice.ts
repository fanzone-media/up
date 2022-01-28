import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import { RootState, ThunkExtra } from '../../boot/types';
import { ILSP4Card } from '../../services/models';
import { STATUS } from '../../utility';
import { ICardsSliceState, ICardItemsState } from './types';

/**
 * **************
 *    ENTITIES
 * **************
 * We are using the createEntityAdapter since it provides us with pre-built functionality
 */
const cardsAdapter = createEntityAdapter<ILSP4Card>({
  selectId: (e) => e.address,
});

/**
 * **************
 *     STATE
 * **************
 */
const initialState: ICardsSliceState = {
  issuedItems: cardsAdapter.getInitialState<ICardItemsState>({
    status: STATUS.IDLE,
    error: null,
  }),
  ownedItems: cardsAdapter.getInitialState<ICardItemsState>({
    status: STATUS.IDLE,
    error: null,
  }),
};

/**
 * **************
 *     THUNKS
 * **************
 */

export const fetchIssuedCards = createAsyncThunk<
  ILSP4Card[],
  { network: string; profileAddress: string },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchIssuedCards',
  async ({ network, profileAddress }, { extra: { api } }) => {
    const res = await api.cards.fetchProfileIssuedAssets(
      network,
      profileAddress,
    );
    return res as ILSP4Card[];
  },
);

export const fetchCard = createAsyncThunk<
  ILSP4Card,
  { assetAdd: string; profileAdd: string },
  { state: RootState; extra: ThunkExtra }
>('cards/fetchCard', async ({ assetAdd, profileAdd }, { extra: { api } }) => {
  const res = await api.cards.fetchCard(assetAdd, profileAdd);
  return res as ILSP4Card;
});

export const fetchOwnedCards = createAsyncThunk<
  ILSP4Card[],
  { network: string; profileAdd: string },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchOwnedCards',
  async ({ network, profileAdd }, { extra: { api } }) => {
    const res = await api.cards.fetchProfileOwnedAssets(network, profileAdd);
    return res as ILSP4Card[];
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
      .addCase(fetchIssuedCards.pending, (state, _action) => {
        state.issuedItems.status = STATUS.LOADING;
      })
      .addCase(fetchIssuedCards.fulfilled, (state, action) => {
        cardsAdapter.upsertMany(
          state.issuedItems,
          action.payload as ILSP4Card[],
        );
        state.issuedItems.status = STATUS.IDLE;
      })
      .addCase(fetchIssuedCards.rejected, (state, action) => {
        state.issuedItems.error = action.error;
        state.issuedItems.status = STATUS.FAILED;
      });
    builder
      .addCase(fetchCard.pending, (state, _action) => {
        state.issuedItems.status = STATUS.LOADING;
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertOne(
            state.issuedItems,
            action.payload as ILSP4Card,
          );
        state.issuedItems.status = STATUS.IDLE;
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state.issuedItems.error = action.error;
        state.issuedItems.status = STATUS.FAILED;
      });
    builder
      .addCase(fetchOwnedCards.pending, (state, _action) => {
        state.ownedItems.status = STATUS.LOADING;
      })
      .addCase(fetchOwnedCards.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertMany(
            state.ownedItems,
            action.payload as ILSP4Card[],
          );
        state.ownedItems.status = STATUS.IDLE;
      })
      .addCase(fetchOwnedCards.rejected, (state, action) => {
        state.issuedItems.error = action.error;
        state.ownedItems.status = STATUS.FAILED;
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
} = cardsAdapter.getSelectors<RootState>((state) => state.cards.issuedItems);

export const {
  selectAll: selectAllOwnedItems,
  selectById: selectOwnedCardById,
  selectIds: selectOwnedCardIds,
} = cardsAdapter.getSelectors<RootState>((state) => state.cards.ownedItems);

/**
 * ************
 *   ACTIONS
 * ************
 */

export const { anyEvent } = cardsSlice.actions;
