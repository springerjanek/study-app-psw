import { useAuth } from "./auth/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <>
      <h1>Welcome, {user.username}!</h1>
    </>
  );
}

export default App;
