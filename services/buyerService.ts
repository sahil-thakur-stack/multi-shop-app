import api from './api';

export const buyerService = {
  getStores: async () => {
    const res = await api.get('/api/buyer/stores');
    return res.data;
  },

  getStoreProducts: async (storeId: number) => {
    const res = await api.get(`/api/buyer/stores/${storeId}/products`);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/api/buyer/profile');
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await api.put('/api/buyer/profile', data);
    return res.data;
  },

  addToCart: async (data: any) => {
    const res = await api.post('/api/buyer/cart/items', data);
    return res.data;
  },

  getCart: async (cartId: number) => {
    const res = await api.get(`/api/buyer/cart/${cartId}`);
    return res.data;
  },

  updateCartItem: async (cartItemId: number, data: any) => {
    const res = await api.put(`/api/buyer/cart/items/${cartItemId}`, data);
    return res.data;
  },

  removeCartItem: async (cartItemId: number) => {
    const res = await api.delete(`/api/buyer/cart/items/${cartItemId}`);
    return res.data;
  },

  checkout: async (data: any) => {
    const res = await api.post('/api/buyer/checkout', data);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/api/buyer/orders');
    return res.data;
  },

  getOrder: async (orderId: number) => {
    const res = await api.get(`/api/buyer/orders/${orderId}`);
    return res.data;
  },

  verifyPaymentOTP: async (data: any) => {
    const res = await api.post('/api/buyer/payment-otp/verify', data);
    return res.data;
  },

  sendPaymentOTP: async (data: any) => {
    const res = await api.post('/api/buyer/payment-otp/send', data);
    return res.data;
  },
};
