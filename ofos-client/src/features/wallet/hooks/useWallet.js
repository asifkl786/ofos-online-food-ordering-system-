import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWallet,
  fetchBalance,
  addMoney,
  payWithWallet,
  fetchTransactionHistory,
  requestWithdrawal,
  clearWallet,
} from '../slices/walletSlice';

export const useWallet = () => {
  const dispatch = useDispatch();
  const { wallet, balance, transactions, isLoading, error, pagination } = useSelector(
    (state) => state.wallet
  );

  const getWallet = () => {
    dispatch(fetchWallet());
  };

  const getBalance = () => {
    dispatch(fetchBalance());
  };

  const addFunds = (amount, paymentMethod) => {
    return dispatch(addMoney({ amount, paymentMethod }));
  };

  const payByWallet = (orderId) => {
    return dispatch(payWithWallet(orderId));
  };

  const getTransactions = (page = 0, size = 10) => {
    dispatch(fetchTransactionHistory({ page, size }));
  };

  const withdraw = (amount, upiId) => {
    return dispatch(requestWithdrawal({ amount, upiId }));
  };

  const clear = () => {
    dispatch(clearWallet());
  };

  return {
    // State
    wallet,
    balance,
    transactions,
    isLoading,
    error,
    pagination,
    
    // Actions
    getWallet,
    getBalance,
    addFunds,
    payByWallet,
    getTransactions,
    withdraw,
    clear,
  };
};