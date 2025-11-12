import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="39614023127-o5825ppha27sk7j8f8gvmhaclgmqhbfu.apps.googleusercontent.com">
      <App />
      <ToastContainer position="top-right" autoClose={2000} />
    </GoogleOAuthProvider>
  </StrictMode>
);
