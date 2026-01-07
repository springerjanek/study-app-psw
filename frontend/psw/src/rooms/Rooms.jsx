import { CreateRoomModal } from "./modals/CreateRoomModal";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Search, XIcon } from "lucide-react";

export const Rooms = () => {
  const {
    rooms,
    userRoomMemberships,
    createRoom,
    requestAccess,
    fetchAllRooms,
    fetchUserRoomMemberships,
    searchRooms,
  } = useRooms();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllRooms();
    fetchUserRoomMemberships();
  }, []);

  const joinRoom = async (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchRooms({ searchQuery });
    } else {
      fetchAllRooms();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchAllRooms();
  };

  return (
    <div className="px-6 py-1">
      <div className="flex justify-center my-6">
        <CreateRoomModal createRoom={createRoom} />
      </div>

      <div className="max-w-2xl mx-auto mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            )}
          </div>
          <Button type="submit" size="icon" variant="default">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-4">Available Rooms:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center mb-36 ">
        {rooms.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No rooms found
          </div>
        ) : (
          rooms.map((room) => {
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
          })
        )}
      </div>
    </div>
  );
};
