// stores/notification.store.ts
import { create } from "zustand";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifs: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  initSocket: () => void;
};

export interface Notification {
  id: string;
  type: "card_assigned" | "comment_added" | "card_due_soon" | "mentioned";
  title: string;
  body: string;
  isRead: boolean;
  entityId: string | null;
  entityType: string | null;
  createdAt: string;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifs: async () => {
    set({ isLoading: true });
    const notifications = (await api.get("/notifications")) as Notification[];
    set({
      notifications,
      unreadCount: notifications.filter((n: Notification) => !n.isRead).length,
      isLoading: false,
    });
  },

  markRead: async (notificationId) => {
    await api.patch(`/notifications/${notificationId}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch("/notifications/read-all");
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  initSocket: () => {
    socket.off("notification:new");
    socket.on(
      "notification:new",
      ({ notification }: { notification: Notification }) => {
        set((s) => ({
          notifications: [notification, ...s.notifications],
          unreadCount: s.unreadCount + 1,
        }));
      },
    );
  },
}));
