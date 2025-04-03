"use client";
import React, { useEffect, useState } from "react";
import useWebSocket from "@/hooks/useWebSocket";
import { NotificationDto } from "@/lib/model/type";
const WebSocketComponent = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const { messages } = useWebSocket(userId);

  // Chỉ lấy userId từ localStorage trên client-side
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
    if (!messages) return;

    const receivedNotifications: NotificationDto[] = messages.map((msg) => ({
      id: msg.id,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      title: msg.title,
      message: msg.message,
      isRead: msg.isRead,
      type: msg.type,
      userId: msg.userId,
    }));

    setNotifications(receivedNotifications);
  }, [messages]);

  if (userId === null) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  return (
    <div className="p-4">
      <h2>Thông báo</h2>
      <div className="border p-2 h-40 overflow-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.isRead ? "read" : "unread"}`}
            style={{ padding: "10px", border: "1px solid #ccc", marginBottom: "10px" }}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebSocketComponent;
