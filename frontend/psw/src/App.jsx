import { useState } from "react";
import Login from "./auth/Login";

function App() {
  const handleLogin = async ({ email, password }) => {
    try {
      const result = await fetch("http://localhost:7777/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password: password }),
      });

      const json = await result.json();
      console.log(json);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Login onSubmit={handleLogin}></Login>
    </div>
  );
}

export default App;
