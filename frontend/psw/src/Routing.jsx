import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import App from "./app";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { Rooms } from "./rooms/Rooms";
import { Layout } from "./layout";
import { Room } from "./rooms/room/Room";
import { AdminPanel } from "./adminPanel/AdminPanel";

export const Routing = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<App />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
