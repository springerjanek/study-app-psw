import { Link } from "react-router";
import { useAuth } from "./auth/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <h1>Welcome, {user.username}!</h1>
      <p>
        Please visit{" "}
        <Link className="underline mr-1" to="/rooms">
          Rooms
        </Link>
        to get started.
      </p>
    </div>
  );
}

export default App;
