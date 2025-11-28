import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import App from "./app";
import Login from "./auth/Login";
import { Rooms } from "./rooms/Rooms";
import { Layout } from "./layout";

export const Routing = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<App />} />
            <Route path="/rooms" element={<Rooms />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
