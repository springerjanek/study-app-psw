import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, XCircle } from "lucide-react";

export const Members = ({
  roomDetails,
  handleApproveUser,
  removeMember,
  user,
  isUserTheOwner,
}) => {
  return (
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
                {isUserTheOwner && member.id !== user.id && (
                  <XCircle
                    onClick={() =>
                      removeMember({
                        roomId: roomDetails.room.id,
                        userId: member.id,
                      })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                )}
              </div>
            ))}
          </div>

          {roomDetails.pendingRequests.length > 0 && (
            <>
              <Separator className="my-4" />
              <h3 className="text-sm font-semibold mb-3">Pending Requests</h3>

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

                    <Button size="sm" onClick={() => handleApproveUser(pr)}>
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
  );
};
