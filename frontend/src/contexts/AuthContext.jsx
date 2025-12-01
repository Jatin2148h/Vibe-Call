import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import servers from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: servers.backend,   // ⭐ VERY IMPORTANT FIX
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // CHECK LOGIN
  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  // ⭐ REGISTER — FULLY FIXED
  const handleRegister = async (name, username, password) => {
    try {
      const res = await client.post("/api/users/register", {
        name,
        username,
        password,
      });

      if (res.status === httpStatus.Created) {
        return res.data.message; // Snackbar message
      }

    } catch (err) {
      throw err.response?.data || { message: "Registration failed" };
    }
  };

  // ⭐ LOGIN — FULLY FIXED
  const handleLogin = async (username, password) => {
    try {
      const res = await client.post("/api/users/login", {
        username,
        password,
      });

      if (res.status === httpStatus.Ok) {
        localStorage.setItem("token", res.data.token);

        navigate("/home");
        return { success: true };
      }

    } catch (err) {
      throw err.response?.data || { message: "Login failed" };
    }
  };

  // ⭐ ADD TO HISTORY
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

  // ⭐ GET USER HISTORY
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

  // ⭐ DELETE HISTORY ITEM
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

  // ⭐ CONTEXT RETURN
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
