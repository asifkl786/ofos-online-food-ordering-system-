import api from '../../../api/axiosConfig';

export const walletService = {
  // Get wallet details
  getWallet: () => {
    return api.get('/wallet');
  },

  // Get wallet balance
  getBalance: () => {
    return api.get('/wallet/balance');
  },

  // Add money to wallet
  addMoney: (amount, paymentMethod) => {
    return api.post('/wallet/add-money', { amount, paymentMethod });
  },

  // Pay with wallet
  payWithWallet: (orderId) => {
    return api.post('/wallet/pay', { orderId });
  },

  // Get transaction history
  getTransactionHistory: (page = 0, size = 10) => {
    return api.get('/wallet/transactions', { params: { page, size } });
  },

  // Get transaction by reference
  getTransactionByReference: (reference) => {
    return api.get(`/wallet/transactions/${reference}`);
  },

  // Request withdrawal
  requestWithdrawal: (amount, upiId) => {
    return api.post('/wallet/withdraw', { amount, upiId });
  },
};