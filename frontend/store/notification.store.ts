// stores/notification.store.ts
import { create } from "zustand";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  type: "card_assigned" | "comment_added" | "card_due_soon" | "mentioned";
  title: string;
  body: string;
  isRead: boolean;
  entityId: string | null;
  entityType: string | null;
  createdAt: string;
};

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  initSocket: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      // 1. Get the raw response from Axios
      const notifications = await api.get<Notification[]>("/notifications");
      console.log("📦 RAW BACKEND notifications:", notifications);

      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
      set({ isLoading: false }); // Ensure we stop the loading spinner on fail
    }
  },

  markRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
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
