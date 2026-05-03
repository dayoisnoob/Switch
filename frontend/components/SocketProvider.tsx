"use client";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useNotificationStore } from "@/store/notification.store";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { fetch, initSocket } = useNotificationStore();

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      fetch();
      initSocket();
    });

    return () => {
      socket.off("notification:new");
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
