import { CreateRoomModal } from "./CreateRoomModal";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useRooms } from "@/hooks/useRooms";

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
  const {
    rooms,
    userRoomMemberships,
    createRoom,
    requestAccess,
    fetchAllRooms,
    fetchUserRoomMemberships,
  } = useRooms();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllRooms();
    fetchUserRoomMemberships();
  }, []);

  const joinRoom = async (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="px-6">
      <div className="flex justify-center my-6">
        <CreateRoomModal createRoom={createRoom} />
      </div>

      <h2 className="text-xl font-semibold mb-4">Available Rooms:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {rooms.map((room) => {
          const { id, name, description } = room;

          const isMember = userRoomMemberships.includes(id);

          return (
            <Item
              key={id}
              variant="outline"
              className="w-full max-w-xs flex flex-col justify-between shadow-md"
            >
              <ItemContent>
                <ItemMedia variant="image" className="mb-3 m-auto">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4595/4595043.png"
                    className="w-20 h-20 object-contain"
                  />
                </ItemMedia>

                <ItemTitle className="text-center">{name} ROOM</ItemTitle>
                <ItemDescription className="text-center">
                  {description}
                </ItemDescription>
              </ItemContent>

              <ItemActions className="flex justify-center p-3">
                {isMember ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => joinRoom(id)}
                  >
                    Join Room
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => requestAccess(id)}
                  >
                    Request Access
                  </Button>
                )}
              </ItemActions>
            </Item>
          );
        })}
      </div>
    </div>
  );
};
