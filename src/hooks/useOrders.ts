import { useState, useEffect } from 'react';
import { Order } from '../types';
import { subscribeOrders } from '../firebase/firestore';
import { OrderService } from '../services/order';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const createOrder = async (order: Order): Promise<void> => {
    return OrderService.create(order);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<void> => {
    return OrderService.updateStatus(orderId, status, paymentStatus);
  };

  const getOrderById = async (id: string): Promise<Order | null> => {
    return OrderService.getById(id);
  };

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    getOrderById
  };
};
