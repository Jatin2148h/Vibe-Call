import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import servers from "../environment";
export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${servers}/api/users`,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // REGISTER
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

  // LOGIN
  const handleLogin = async (username, password) => {
    const request = await client.post("/login", { username, password });

    if (request.status === httpStatus.OK) {
      localStorage.setItem("token", request.data.token);
      navigate("/home");
    }
  };

  // ADD HISTORY — guest blocked
  const addToUserHistory = async (meetingCode) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Guest user — history not saved");
      return;
    }

    try {
      const request = await client.post(
        "/add_to_activity",
        { meeting_code: meetingCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return request;
    } catch (e) {
      console.warn("History save failed:", e.message);
      return { error: true };
    }
  };

  // GET HISTORY
  const getHistoryOfUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) return [];

    try {
      const request = await client.get("/get_all_activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return request.data;
    } catch (err) {
      console.log("History fetch failed:", err);
      return [];
    }
  };

  // DELETE HISTORY
  const deleteHistoryItem = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) return { success: false };

    try {
      await client.delete(`/delete_activity/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
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
 