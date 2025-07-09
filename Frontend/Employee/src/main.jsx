// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter } from "react-router-dom"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
   
      <AuthProvider>
        <App />
      </AuthProvider>
    
  </React.StrictMode>
);
