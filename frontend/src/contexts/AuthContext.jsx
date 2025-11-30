import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import servers from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${servers.backend}/api/users`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  const handleRegister = async (name, username, password) => {
    const request = await client.post("/register", {
      name,
      username,
      password,
    });

    if (request.status === httpStatus.CREATED) {
      return request.data.message;
    }
  };

  const handleLogin = async (username, password) => {
    const request = await client.post("/login", { username, password });

    if (request.status === httpStatus.OK) {
      localStorage.setItem("token", request.data.token);
      navigate("/home");
    }
  };

  const addToUserHistory = async (meetingCode) => {
    if (!isLoggedIn()) return;

    try {
      await client.post(
        "/add_to_activity",
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

  const getHistoryOfUser = async () => {
    if (!isLoggedIn()) return [];

    try {
      const request = await client.get("/get_all_activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return request.data;
    } catch {
      return [];
    }
  };

  const deleteHistoryItem = async (id) => {
    if (!isLoggedIn()) return { success: false };

    try {
      await client.delete(`/delete_activity/${id}`, {
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
        addToUserHistory,
        getHistoryOfUser,
        deleteHistoryItem,
        handleRegister,
        handleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
