import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

export const Messages = ({ allMessages, user, bottomRef }) => {
  return (
    <ScrollArea className="max-h-32 flex-1 min-h-0 p-4">
      <div className="space-y-4">
        {allMessages.map((msg) => {
          const { name, content, created_at, user_id } = msg;
          const isOwnMessage = user_id === user.id;
          const date = new Date(created_at).toLocaleString();

          return (
            <div
              key={created_at}
              className={`flex gap-3 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
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
  );
};
