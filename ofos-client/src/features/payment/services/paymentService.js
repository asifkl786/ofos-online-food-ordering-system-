import api from '../../../api/axiosConfig';

export const paymentService = {
  // Initialize payment (mock)
  initiatePayment: (orderId, paymentMethod) => {
    return api.post('/payments/initiate', {
      orderId,
      paymentMethod
    });
  },

  // Process mock payment and persist the selected method in backend payment records.
  processMockPayment: async (orderId, paymentDetails) => {
    const initResponse = await paymentService.initiatePayment(orderId, paymentDetails.method);
    const paymentInit = initResponse.data?.data || {};

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success (90% success rate for demo)
    const isSuccess = Math.random() < 0.9;
    
    if (isSuccess) {
      await api.post('/payments/webhook', {
        orderId: String(orderId),
        razorpayOrderId: paymentInit.paymentOrderId,
        razorpayPaymentId: 'MOCK_' + Date.now(),
        razorpaySignature: 'MOCK_SIGNATURE',
        status: 'SUCCESS'
      });

      return {
        success: true,
        paymentId: 'MOCK_' + Date.now(),
        orderId: orderId,
        amount: paymentDetails.amount,
        paymentMethod: paymentDetails.method,
        status: 'SUCCESS',
        message: 'Payment successful!'
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
        status: 'FAILED'
      };
    }
  },

  // Get payment status
  getPaymentStatus: (orderId) => {
    return api.get(`/payments/order/${orderId}`);
  },

  // Update order payment status after mock payment
  updateOrderPaymentStatus: (orderId, status) => {
    return api.post(`/payments/cod/${orderId}`, { status });
  }
};
