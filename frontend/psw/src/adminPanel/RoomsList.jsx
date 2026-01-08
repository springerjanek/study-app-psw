import { Trash2, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export const RoomsList = ({ rooms, openDeleteDialog, deletingId }) => {
  return (
    <TabsContent value="rooms">
      <Card>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No rooms found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b font-medium text-sm text-muted-foreground">
                <div className="col-span-4">Room</div>
                <div className="col-span-3">Owner ID</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 rounded-md transition-colors items-center"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {room.name || "Unnamed Room"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        ID: {room.id}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 col-span-3 text-sm truncate">
                    {room.created_by}
                  </div>
                  <div className="col-span-2 text-sm">
                    {room.created_at
                      ? new Date(room.created_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        openDeleteDialog("room", room.id, room.name)
                      }
                      disabled={deletingId === room.id}
                    >
                      {deletingId === room.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
