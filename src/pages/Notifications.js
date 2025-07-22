import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  API_ENDPOINTS,
  getApiConfig,
  handleApiResponse,
  handleApiError,
} from "../utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notifications = ({ mode }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define colors based on mode
  const getCardColors = () => {
    if (mode === "dark") {
      return {
        background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
        text: "#ffffff",
        textSecondary: "#cccccc",
        cardBackground: "#2d2d2d",
        border: "1px solid rgba(255,255,255,0.1)",
        shadow: "0 4px 16px rgba(0,0,0,0.3)",
        readBackground: "#1a1a1a",
        unreadBackground: "#2d2d2d",
      };
    }
    return {
      background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      text: "#1a1a1a",
      textSecondary: "#666666",
      cardBackground: "#ffffff",
      border: "none",
      shadow: "0 4px 16px rgba(0,0,0,0.08)",
      readBackground: "#f9f9f9",
      unreadBackground: "#e6f7ff",
    };
  };

  const cardColors = getCardColors();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to view notifications.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios(
          getApiConfig(API_ENDPOINTS.USER_NOTIFICATIONS)
        );
        const data = handleApiResponse(response);
        setNotifications(data.data || []);
      } catch (err) {
        setError(handleApiError(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
    );
    try {
      await axios(
        getApiConfig(API_ENDPOINTS.USER_NOTIFICATION_MARK_READ(id), "PATCH")
      );
      // No need to update state again, already done
    } catch (err) {
      // Optionally handle error: revert UI if needed
    }
  };

  return (
    <div
      className="notifications-page"
      style={{ 
        maxWidth: 600, 
        margin: "0 auto", 
        padding: 24,
        background: cardColors.background,
        color: cardColors.text,
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <h2 style={{ 
        color: cardColors.text,
        textAlign: "center",
        marginBottom: "2rem",
        fontWeight: 900,
        letterSpacing: 1,
      }}>
        Notifications
      </h2>
      {loading ? (
        <div style={{ 
          textAlign: "center", 
          color: cardColors.text,
          fontSize: "1.1rem",
          fontWeight: 600,
        }}>
          Loading notifications...
        </div>
      ) : error ? (
        <div style={{ 
          color: "#ff6b6b", 
          textAlign: "center",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: mode === "dark" ? "rgba(255,107,107,0.1)" : "rgba(255,107,107,0.05)",
        }}>
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          color: cardColors.textSecondary,
          fontSize: "1.1rem",
          fontWeight: 600,
          padding: "2rem",
        }}>
          No notifications found.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((notif) => (
            <li
              key={notif._id}
              style={{
                border: cardColors.border,
                borderRadius: 12,
                marginBottom: 16,
                padding: 20,
                background: notif.read ? cardColors.readBackground : cardColors.unreadBackground,
                boxShadow: cardColors.shadow,
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: mode === "dark" ? "0 6px 20px rgba(0,0,0,0.4)" : "0 6px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <div style={{ 
                fontWeight: notif.read ? "normal" : "bold",
                color: cardColors.text,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}>
                {notif.message}
              </div>
              <div style={{ 
                fontSize: 12, 
                color: cardColors.textSecondary,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ 
                  backgroundColor: mode === "dark" ? "#FFD700" : "#1976d2",
                  color: mode === "dark" ? "#000" : "#fff",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: 600,
                }}>
                  {notif.type}
                </span>
                <span>•</span>
                <span>
                {notif.createdAt
                  ? new Date(notif.createdAt).toLocaleString()
                  : ""}
                </span>
              </div>
              {!notif.read && (
                <button
                  style={{ 
                    marginTop: 12,
                    backgroundColor: mode === "dark" ? "#FFD700" : "#1976d2",
                    color: mode === "dark" ? "#000" : "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: mode === "dark" ? "#FFC700" : "#1565c0",
                      transform: "translateY(-1px)",
                    },
                  }}
                  onClick={() => markAsRead(notif._id)}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
