import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const s = io("https://localhost:7777");
    setSocket(s);

    s.on("activeUsers", (count) => setUserCount(count));

    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, userCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
