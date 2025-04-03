import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const useWebSocket = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = io("http://localhost:3000", {
      query: { userId }, // Truyền userId khi kết nối
      transports: ["websocket"], // Chỉ dùng WebSocket, tránh polling
    });

    ws.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    ws.on("data", (data) => {
      setMessages((prev) => [...prev, data]);
      console.log(data)
    });

    ws.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [userId]);

  const sendMessage = (event: string, message: any) => {
    socket?.emit(event, message);
  };

  return { messages, sendMessage };
};

export default useWebSocket;
