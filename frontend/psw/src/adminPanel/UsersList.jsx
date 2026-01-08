import { Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const UsersList = ({ users, openDeleteDialog, deletingId }) => {
  return (
    <TabsContent value="users">
      <Card>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b font-medium text-sm text-muted-foreground">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>
              {users.map((u) => (
                <div
                  key={u.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 rounded-md transition-colors items-center"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {u.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {u.username || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        ID: {u.id}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                    >
                      {u.role || "user"}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-sm">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div className="col-span-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog("user", u.id, u.username)}
                      disabled={deletingId === u.id || u.role === "admin"}
                    >
                      {deletingId === u.id ? (
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
