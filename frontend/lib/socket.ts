import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
  autoConnect: false,
  auth: (cb) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("__auth.access="))
      ?.split("=")[1];

    cb({ token });
  },
});
