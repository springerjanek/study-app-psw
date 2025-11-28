import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../auth/AuthContext";
import { CreateRoomModal } from "./CreateRoomModal";
import { useState, useEffect } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "sonner";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import { Button } from "@/components/ui/button";

export const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();
  const { authFetch } = useAuthFetch();

  useEffect(() => {
    const fetchAllRooms = async () => {
      const result = await authFetch("/allRooms");
      setRooms(result.rooms);
    };

    fetchAllRooms();
  }, []);

  const createRoom = async ({ name, description, users }) => {
    const roomId = uuidv4();
    const result = await authFetch("/createRoom", {
      method: "POST",
      body: JSON.stringify({
        id: roomId,
        name: name,
        description: description,
        users: users,
        created_by: user.id,
      }),
    });

    if (result.success) {
      toast.success("Successfully created room!");
    }
  };

  return (
    <div>
      Available Rooms:
      {rooms.map((room) => {
        const { id, name, description } = room;
        return (
          <Item key={id} variant="outline">
            <ItemContent>
              <ItemTitle>{name} ROOM</ItemTitle>
              <ItemDescription>{description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Join room.
                {/* check if user has rights (is in room_members), also maybe request for join. */}
              </Button>
            </ItemActions>
          </Item>
        );
      })}
      <CreateRoomModal createRoom={createRoom} />
    </div>
  );
};
