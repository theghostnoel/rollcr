'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: number;
  type: 'reply' | 'reaction';
  from: string;
  content: string;
  postId: string;
  commentId?: number;
  createdAt: string;
  read: boolean;
}

export default function NotificationButton({ currentUser }: { currentUser: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const userNotifications = localStorage.getItem(`notifications_${currentUser.displayName || currentUser.username}`);
      if (userNotifications) {
        const notifs = JSON.parse(userNotifications);
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      }
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <Link href="/notifications" className="relative text-gray-600 hover:text-gray-800">
      <i className="ri-notification-line w-6 h-6 flex items-center justify-center"></i>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}