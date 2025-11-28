import React from "react";
import { Navbar } from "./Navbar";
import { Outlet } from "react-router";
import { Toaster } from "sonner";

export const Layout = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", padding: "2rem" }}>
      <Navbar />
      <Outlet />
      <Toaster />
    </div>
  );
};
