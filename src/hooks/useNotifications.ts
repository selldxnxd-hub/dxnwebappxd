import { useState, useEffect } from 'react';
import { SystemNotification } from '../types';
import { subscribeNotifications } from '../firebase/firestore';
import { NotificationService } from '../services/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeNotifications((data) => {
      setNotifications(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const markAsRead = async (id: string): Promise<void> => {
    return NotificationService.markAsRead(id);
  };

  const deleteNotification = async (id: string): Promise<void> => {
    return NotificationService.delete(id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    deleteNotification
  };
};
