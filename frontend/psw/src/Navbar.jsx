import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router";
import { useAuth } from "./auth/AuthContext";
import { Button } from "./components/ui/button";
import { PulseIcon } from "./components/ui/icons/svg-spinners-pulse";
import { useSocket } from "./context/SocketContext";

export const Navbar = () => {
  const { logout } = useAuth();
  const { userCount } = useSocket();
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <div className="flex">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/rooms">Rooms</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </NavigationMenuItem>
        </div>
        <NavigationMenuItem>
          <div className="flex gap-1.5">
            Active Users: {userCount} <PulseIcon color="green" />
          </div>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
