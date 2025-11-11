// src/components/auth/logout.jsx
import axios from "axios";
import { toast } from "react-toastify";

const handleLogout = async (navigate) => {
  const token = localStorage.getItem("token");

  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    console.error("Logout error:", err.response?.data || err.message);
  }

  // Clear local storage + redirect
  localStorage.removeItem("token");
  sessionStorage.clear();
  toast.info("You have been logged out.");
  navigate("/login");
};

export default handleLogout;
