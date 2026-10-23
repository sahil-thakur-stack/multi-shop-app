import api from './api';

export const sellerService = {
  submitOnboarding: async (data: FormData) => {
    const res = await api.post('/api/seller/onboarding', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getApprovalStatus: async () => {
    const res = await api.get('/api/seller/approval-status');
    return res.data;
  },

  onboard: async (data: FormData) => {
    const res = await api.post('/api/seller/onboarding', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  createProduct: async (data: any) => {
    const res = await api.post('/api/seller/products', data);
    return res.data;
  },

  getMyProducts: async () => {
    const res = await api.get('/api/seller/products');
    return res.data;
  },

  updateProduct: async (productId: number, data: any) => {
    const res = await api.put(`/api/seller/products/${productId}`, data);
    return res.data;
  },

  deleteProduct: async (productId: number) => {
    const res = await api.delete(`/api/seller/products/${productId}`);
    return res.data;
  },

  getOrders: async () => {
    const res = await api.get('/api/seller/orders');
    return res.data;
  },

  acceptOrder: async (orderId: number) => {
    const res = await api.post(`/api/seller/orders/${orderId}/accept`);
    return res.data;
  },

  rejectOrder: async (orderId: number) => {
    const res = await api.post(`/api/seller/orders/${orderId}/reject`);
    return res.data;
  },

  createDeliveryWorker: async (data: any) => {
    const res = await api.post('/api/seller/delivery-workers', data);
    return res.data;
  },

  getDeliveryWorkers: async () => {
    const res = await api.get('/api/seller/delivery-workers');
    return res.data;
  },

  updateDeliveryWorker: async (workerId: number, data: any) => {
    const res = await api.put(`/api/seller/delivery-workers/${workerId}`, data);
    return res.data;
  },

  deleteDeliveryWorker: async (workerId: number) => {
    const res = await api.delete(`/api/seller/delivery-workers/${workerId}`);
    return res.data;
  },

  assignDeliveryWorker: async (orderId: number, workerId: number) => {
    const res = await api.post(
      `/api/seller/orders/${orderId}/assign-worker/${workerId}`
    );
    return res.data;
  },

  pickUpOrder: async (orderId: number) => {
    const res = await api.post(`/api/seller/orders/${orderId}/pickup`);
    return res.data;
  },

  outForDelivery: async (orderId: number) => {
    const res = await api.post(`/api/seller/orders/${orderId}/out-for-delivery`);
    return res.data;
  },

  deliverOrder: async (orderId: number) => {
    const res = await api.post(`/api/seller/orders/${orderId}/deliver`);
    return res.data;
  },

  updateProfile: async (data: any) => {
    const res = await api.put('/api/seller/profile', data);
    return res;
  },

  getShopDetails: async () => {
    const res = await api.get('/api/seller/shop');
    return res;
  },

  updateShopDetails: async (data: any) => {
    const res = await api.put('/api/seller/shop', data);
    return res;
  },
};
