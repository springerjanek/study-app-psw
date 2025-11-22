import { useAuth } from "./auth/AuthContext";
import { useState, useEffect } from "react";
import socketIO from "socket.io-client";
import { useAuthFetch } from "./hooks/useAuthFetch";

function App() {
  const socket = socketIO.connect("http://localhost:7777");

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const { isAuthenticated, logout, user } = useAuth();
  const { authFetch } = useAuthFetch();

  useEffect(() => {
    const fetchAllMessages = async () => {
      const result = await authFetch(`/allMessages?roomId=1`);
      setAllMessages(result.messages);
    };

    if (isAuthenticated) {
      fetchAllMessages();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    socket.on("messageResponse", (data) =>
      setAllMessages([...allMessages, data])
    );
  }, [socket, allMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", {
        content: message,
        name: user.username,
        userId: user.id,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      });
    }
    setMessage("");
  };

  console.log(allMessages);

  if (isAuthenticated) {
    return (
      <div style={{ width: "100vw", height: "100vh", padding: "2rem" }}>
        <h1>Welcome, {user.username}!</h1>
        <button onClick={logout}>Logout</button>

        <div>
          <input
            className="border-gray-400 rounded-xl border-1"
            onChange={(e) => setMessage(e.target.value)}
          ></input>
          <button onClick={handleSendMessage}>SEND MSG</button>

          {allMessages.map((msg) => {
            const { name, content, created_at } = msg;
            return (
              <p>
                {name}: {content}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  return <div style={{ width: "100vw", height: "100vh" }}>Not logged in</div>;
}

export default App;
