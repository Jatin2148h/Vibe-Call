import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import servers from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: servers.backend,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // CHECK LOGIN
  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  // ✅ ✅ FINAL FIXED REGISTER (BUG SOLVED: CREATED)
  const handleRegister = async (name, username, password) => {
    try {
      const res = await client.post("/api/users/register", {
        name,
        username,
        password,
      });

      // 🔥 BUG FIX HERE
      if (res.status === httpStatus.CREATED) {
        return {
          success: true,
          message: res.data.message,
        };
      }

    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Registration failed",
      };
    }
  };

  // ✅ ✅ FINAL FIXED LOGIN (BUG SOLVED: OK)
  const handleLogin = async (username, password) => {
    try {
      const res = await client.post("/api/users/login", {
        username,
        password,
      });

      // 🔥 BUG FIX HERE
      if (res.status === httpStatus.OK) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");

        return {
          success: true,
        };
      }

    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Login failed",
      };
    }
  };

  // ADD TO HISTORY
  const addToUserHistory = async (meetingCode) => {
    if (!isLoggedIn()) return;

    try {
      await client.post(
        "/api/users/add_to_activity",
        { meeting_code: meetingCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch {
      return { error: true };
    }
  };

  // GET USER HISTORY
  const getHistoryOfUser = async () => {
    if (!isLoggedIn()) return [];

    try {
      const res = await client.get("/api/users/get_all_activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return res.data;

    } catch {
      return [];
    }
  };

  // DELETE HISTORY ITEM
  const deleteHistoryItem = async (id) => {
    if (!isLoggedIn()) return { success: false };

    try {
      await client.delete(`/api/users/delete_activity/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return { success: true };
    } catch {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        isLoggedIn,
        handleLogin,
        handleRegister,
        addToUserHistory,
        getHistoryOfUser,
        deleteHistoryItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
