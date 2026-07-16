import { Order } from '../types';
import { OrderService } from './order';

export const PaymentService = {
  verifyTransaction: async (transactionId: string): Promise<boolean> => {
    // Simple transaction format check or database verification
    const cleanTx = transactionId.trim().toUpperCase();
    if (cleanTx.length < 8) return false;
    
    // Check if transaction ID has already been used to prevent double-spend fraud
    const orders = await OrderService.getAll();
    const isDuplicate = orders.some(o => o.transactionId?.toUpperCase() === cleanTx && o.paymentStatus === 'paid');
    
    return !isDuplicate;
  },

  submitManualPayment: async (orderId: string, details: {
    senderNumber: string;
    transactionId: string;
    amountPaid: number;
    paymentScreenshotUrl?: string;
  }): Promise<void> => {
    const order = await OrderService.getById(orderId);
    if (!order) throw new Error('Order not found');

    await OrderService.updateStatus(orderId, 'processing', 'pending');
    
    // Update order with payment details
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      senderNumber: details.senderNumber,
      transactionId: details.transactionId,
      amountPaid: details.amountPaid,
      paymentScreenshotUrl: details.paymentScreenshotUrl || ''
    });
  }
};
