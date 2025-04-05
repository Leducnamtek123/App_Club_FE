"use client";
import React, { useEffect, useState } from "react";
import useWebSocket from "@/hooks/useWebSocket";
import { NotificationDto } from "@/lib/model/type";

const WebSocketComponent = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const { messages } = useWebSocket(userId || undefined); // Truyền undefined nếu không có userId

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser.id);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setNotifications(messages);
    }
  }, [messages]);

  if (userId === null) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  return (
    <div className="p-4">
      <h2>Thông báo {userId ? `cho user ${userId}` : "(Broadcast)"}</h2>
      <div className="border p-2 h-40 overflow-auto">
        {notifications.length === 0 ? (
          <p>Chưa có thông báo</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id || Math.random().toString()}
              className={`notification ${notification.isRead ? "read" : "unread"}`}
              style={{ padding: "10px", border: "1px solid #ccc", marginBottom: "10px" }}
            >
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <small>{new Date(notification.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WebSocketComponent;