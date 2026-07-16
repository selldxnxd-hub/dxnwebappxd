import { getOrders, createOrder, updateOrderStatus, getOrderById } from './db';
import { Order } from '../types';

export const OrderService = {
  getAll: async (): Promise<Order[]> => {
    return getOrders();
  },

  getById: async (id: string): Promise<Order | null> => {
    return getOrderById(id);
  },

  create: async (order: Order): Promise<void> => {
    return createOrder(order);
  },

  updateStatus: async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<void> => {
    return updateOrderStatus(orderId, status, paymentStatus);
  }
};
