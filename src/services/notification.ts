import { getNotifications, markNotificationAsRead, deleteNotification } from './db';
import { SystemNotification } from '../types';

export const NotificationService = {
  getAll: async (): Promise<SystemNotification[]> => {
    return getNotifications();
  },

  markAsRead: async (id: string): Promise<void> => {
    return markNotificationAsRead(id);
  },

  delete: async (id: string): Promise<void> => {
    return deleteNotification(id);
  }
};
