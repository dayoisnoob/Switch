"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useNotificationStore } from "@/store/notification.store";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { fetch, initSocket } = useNotificationStore();

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      const store = useNotificationStore.getState();
      store.fetch();
      store.initSocket();
    };

    // 3. Attach the listener
    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
