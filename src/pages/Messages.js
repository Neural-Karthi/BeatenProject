import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  API_ENDPOINTS,
  getApiConfig,
  handleApiResponse,
  handleApiError,
} from "../utils/api";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios(getApiConfig(API_ENDPOINTS.USER_MESSAGES));
        const data = handleApiResponse(response);
        setMessages(data.data || []);
      } catch (err) {
        setError(handleApiError(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div
      className="messages-page"
      style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}
    >
      <h2>Messages from Admin</h2>
      {loading ? (
        <div>Loading messages...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : messages.length === 0 ? (
        <div>No messages found.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg) => (
            <li
              key={msg._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                marginBottom: 16,
                padding: 16,
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                From: {msg.sender?.name || "Admin"}
              </div>
              <div style={{ margin: "8px 0" }}>{msg.content}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Messages;
