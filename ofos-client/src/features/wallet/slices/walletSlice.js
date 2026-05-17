import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { walletService } from '../services/walletService';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchWallet = createAsyncThunk(
  'wallet/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getWallet();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletService.getBalance();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addMoney = createAsyncThunk(
  'wallet/addMoney',
  async ({ amount, paymentMethod }, { rejectWithValue, dispatch }) => {
    try {
      const response = await walletService.addMoney(amount, paymentMethod);
      toast.success(`₹${amount} added to wallet!`);
      dispatch(fetchWallet());
      dispatch(fetchBalance());
      dispatch(fetchTransactionHistory());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add money';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const payWithWallet = createAsyncThunk(
  'wallet/pay',
  async (orderId, { rejectWithValue, dispatch }) => {
    try {
      const response = await walletService.payWithWallet(orderId);
      toast.success('Payment successful!');
      dispatch(fetchWallet());
      dispatch(fetchTransactionHistory());
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Payment failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'wallet/fetchTransactions',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await walletService.getTransactionHistory(page, size);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const requestWithdrawal = createAsyncThunk(
  'wallet/withdraw',
  async ({ amount, upiId }, { rejectWithValue }) => {
    try {
      const response = await walletService.requestWithdrawal(amount, upiId);
      toast.success('Withdrawal request submitted!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Withdrawal failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  wallet: null,
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWallet: (state) => {
      state.wallet = null;
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wallet
      .addCase(fetchWallet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload;
        state.balance = action.payload?.balance || 0;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Balance
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      })
      // Fetch Transactions
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.content || [];
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Money
      .addCase(addMoney.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addMoney.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
