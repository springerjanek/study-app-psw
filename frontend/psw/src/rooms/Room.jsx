import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { useRooms } from "@/hooks/useRooms";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/auth/AuthContext";
import { Tldraw } from "tldraw";
import { useSyncDemo } from "@tldraw/sync";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Users, Clock } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

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
  } = useRooms();
  const bottomRef = useRef(null);

  const store = useSyncDemo({ roomId: roomId });

  useEffect(() => {
    if (!socket) return;

    fetchRoomDetails({ roomId });

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
      socket.off("messageResponse"); // cleanup listener only
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
        userId: user.id,
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

  if (!userHasRightsToEnter) {
    return <>You are not authorized.</>;
  }

  if (roomDetails.room) {
    return (
      <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-2rem)] grid grid-rows-[1fr_1fr] gap-4">
        <div className="w-full h-full overflow-hidden rounded-lg border">
          <Tldraw store={store} />
        </div>

        <div className="grid grid-cols-[4fr_1fr] gap-4 h-full">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                {roomDetails.room.name}
                <Badge variant="secondary" className="ml-2">
                  <Users className="w-3 h-3 mr-1" />
                  {roomDetails.members.length}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time chat room</CardDescription>
            </CardHeader>

            <ScrollArea className="max-h-64 flex-1 min-h-0 p-4">
              <div className="space-y-4">
                {allMessages.map((msg) => {
                  const { name, content, created_at, userId } = msg;
                  const isOwnMessage = userId === user.id;
                  const date = new Date(created_at).toLocaleString();

                  return (
                    <div key={created_at} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="https://github.com/evilrabbit.png"
                          alt={`@${name}`}
                        />
                        <AvatarFallback>{name}</AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col items-start max-w-[70%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{name}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {date}
                          </span>
                        </div>

                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <CardContent className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members
              </CardTitle>
              <CardDescription>
                {roomDetails.members.length} member(s)
              </CardDescription>
            </CardHeader>

            <ScrollArea className="flex-1 min-h-0">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {roomDetails.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="https://github.com/evilrabbit.png" />
                        <AvatarFallback>{member.username}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.username}</p>
                        {member.id === user.id && (
                          <Badge variant="outline" className="mt-1">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {roomDetails.pendingRequests.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-sm font-semibold mb-3">
                      Pending Requests
                    </h3>

                    <div className="space-y-2">
                      {roomDetails.pendingRequests.map((pr) => (
                        <div
                          key={pr.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="https://github.com/evilrabbit.png" />
                              <AvatarFallback>{pr.username}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{pr.username}</span>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(pr)}
                          >
                            Approve
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
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
