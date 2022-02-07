import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import { RootState, ThunkExtra } from '../../boot/types';
import { ICard } from '../../services/models';
import { STATUS } from '../../utility';
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

/**
 * **************
 *     STATE
 * **************
 */
const initialState: ICardState = cardsAdapter.getInitialState<ICardItemsState>({
    ownedStatus: STATUS.IDLE,
    ownedError: null,
    issuedStatus: STATUS.IDLE,
    issuedError: null,
    status: STATUS.IDLE,
    error: null,
  });

/**
 * **************
 *     THUNKS
 * **************
 */

 export const fetchAllCards = createAsyncThunk<
 ICard[],
 { network: string; addresses: string[] },
 { state: RootState; extra: ThunkExtra }
>(
 'cards/fetchAllCards',
 async ({ network, addresses }, { extra: { api } }) => {
   const res = await api.cards.fetchAllCards(
     network,
     addresses,
   );
   return res as ICard[];
 },
);

export const fetchIssuedCards = createAsyncThunk<
  ICard[],
  { network: string; addresses: string[] },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchIssuedCards',
  async ({ network, addresses }, { extra: { api } }) => {
    const res = await api.cards.fetchAllCards(
      network,
      addresses,
    );
    return res as ICard[];
  },
);

export const fetchCard = createAsyncThunk<
  ICard,
  { assetAdd: string; profileAdd: string },
  { state: RootState; extra: ThunkExtra }
>('cards/fetchCard', async ({ assetAdd, profileAdd }, { extra: { api } }) => {
  const res = await api.cards.fetchCard(assetAdd, profileAdd);
  return res as ICard;
});

export const fetchOwnedCards = createAsyncThunk<
  ICard[],
  { network: string; addresses: string[] },
  { state: RootState; extra: ThunkExtra }
>(
  'cards/fetchOwnedCards',
  async ({ network, addresses }, { extra: { api } }) => {
    const res = await api.cards.fetchAllCards(network, addresses);
    return res as ICard[];
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
      .addCase(fetchAllCards.pending, (state, _action) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchAllCards.fulfilled, (state, action) => {
        cardsAdapter.upsertMany(
          state,
          action.payload as ICard[],
        );
        state.status = STATUS.IDLE;
      })
      .addCase(fetchAllCards.rejected, (state, action) => {
        state.error = action.error;
        state.status = STATUS.FAILED;
      });
    builder
      .addCase(fetchIssuedCards.pending, (state, _action) => {
        state.issuedStatus = STATUS.LOADING;
      })
      .addCase(fetchIssuedCards.fulfilled, (state, action) => {
        cardsAdapter.upsertMany(
          state,
          action.payload as ICard[],
        );
        state.issuedStatus = STATUS.IDLE;
      })
      .addCase(fetchIssuedCards.rejected, (state, action) => {
        state.issuedError = action.error;
        state.issuedStatus = STATUS.FAILED;
      });
    builder
      .addCase(fetchCard.pending, (state, _action) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertOne(
            state,
            action.payload as ICard,
          );
        state.status = STATUS.IDLE;
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state.error = action.error;
        state.status = STATUS.FAILED;
      });
    builder
      .addCase(fetchOwnedCards.pending, (state, _action) => {
        state.ownedStatus = STATUS.LOADING;
      })
      .addCase(fetchOwnedCards.fulfilled, (state, action) => {
        if (action.payload)
          cardsAdapter.upsertMany(
            state,
            action.payload as ICard[],
          );
        state.ownedStatus = STATUS.IDLE;
      })
      .addCase(fetchOwnedCards.rejected, (state, action) => {
        state.ownedError = action.error;
        state.ownedStatus = STATUS.FAILED;
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
  selectEntities: selectCardEntities
} = cardsAdapter.getSelectors<RootState>((state) => state.cards);

/**
 * ************
 *   ACTIONS
 * ************
 */

export const { anyEvent } = cardsSlice.actions;
