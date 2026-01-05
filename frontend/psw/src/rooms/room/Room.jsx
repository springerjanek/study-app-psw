import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useRooms } from "@/hooks/useRooms";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/auth/AuthContext";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { Members } from "./Members";
import { Messages } from "./Messages";
import { MessageInput } from "./MessageInput";
import { EditRoomModal } from "../modals/EditRoomModal";

export const Room = () => {
  let params = useParams();
  const roomId = params.roomId;

  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");
  const { authFetch } = useAuthFetch();
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    fetchRoomDetails,
    approveRequest,
    roomDetails,
    userHasRightsToEnter,
    deleteRoom,
    updateRoom,
    removeMember,
  } = useRooms();
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const store = useSyncDemo({ roomId: roomId });

  useEffect(() => {
    if (!socket) return;

    fetchRoomDetails({ roomId });
    if (!roomDetails.success) {
      return;
    }

    if (!userHasRightsToEnter) return;

    const fetchAllMessages = async () => {
      const result = await authFetch(`/allMessages?roomId=${roomId}`);
      setAllMessages(result.messages);
    };

    fetchAllMessages();

    socket.on("messageResponse", (data) => {
      setAllMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("messageResponse");
    };
  }, [roomId, socket, userHasRightsToEnter]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [allMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", {
        content: message,
        name: user.username,
        user_id: user.id,
        id: `${socket.id}${Math.random()}`,
        roomId: roomId,
        socketID: socket.id,
      });
    }
    setMessage("");
  };

  const handleApproveUser = (pendingRequest) => {
    const userId = pendingRequest.id;
    approveRequest({ roomId, userId });
    fetchRoomDetails();
  };

  const handleDeleteRoom = async () => {
    await deleteRoom({ roomId });
    navigate("/rooms");
  };

  if (!roomDetails.success) {
    return <p>Room not found.</p>;
  }

  if (!userHasRightsToEnter) {
    return <p>You are not authorized.</p>;
  }

  if (roomDetails.room) {
    const isUserTheOwner = roomDetails.room.created_by === user.id;
    return (
      <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-2rem)] grid grid-rows-[1fr_1fr] gap-4">
        <div className="w-full h-full overflow-hidden rounded-lg border">
          <Tldraw store={store} />
        </div>

        <div className="grid grid-cols-[4fr_1fr] gap-4 h-full">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {roomDetails.room.name}
                  <Badge variant="secondary" className="ml-2">
                    <Users className="w-3 h-3 mr-1" />
                    {roomDetails.members.length}
                  </Badge>
                  {isUserTheOwner && (
                    <EditRoomModal
                      updateRoom={updateRoom}
                      roomId={roomDetails.room.id}
                      roomName={roomDetails.room.name}
                      roomDescription={roomDetails.room.description}
                    />
                  )}
                </CardTitle>
                <CardDescription>Real-time chat room</CardDescription>
              </div>

              {isUserTheOwner && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteRoom}
                >
                  Delete Room
                </Button>
              )}
            </CardHeader>

            <Messages
              user={user}
              allMessages={allMessages}
              bottomRef={bottomRef}
            />
            <MessageInput
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
            />
          </Card>

          <Members
            roomDetails={roomDetails}
            handleApproveUser={handleApproveUser}
            removeMember={removeMember}
            user={user}
            isUserTheOwner={isUserTheOwner}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading Room...</CardTitle>
          <CardDescription>
            Please wait while we load the chat room
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
