import React from "react";
import { Navbar } from "./Navbar";
import { Outlet } from "react-router";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "sonner";
import "tldraw/tldraw.css";

export const Layout = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", padding: "2rem" }}>
      <SocketProvider>
        <Navbar />
        <Outlet />
      </SocketProvider>
      <Toaster position="top-right" />
    </div>
  );
};
