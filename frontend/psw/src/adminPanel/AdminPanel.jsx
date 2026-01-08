import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useRooms } from "@/hooks/useRooms";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { Statistics } from "./Statistics";
import { RoomsList } from "./RoomsList";
import { UsersList } from "./UsersList";

import { Users, Home, Shield, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteDialog } from "./DeleteDialog";

export const AdminPanel = () => {
  const { loading, user } = useAuth();
  const { fetchAllRooms, rooms, deleteRoom } = useRooms();
  const { authFetch } = useAuthFetch();
  const [users, setUsers] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null,
    id: null,
    name: null,
  });

  const fetchAllUsers = async () => {
    try {
      const result = await authFetch(`/users`);
      setUsers(result);
    } catch (err) {
      console.error("Failed to fetch users");
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllRooms();
  }, []);

  const handleDeleteUser = async (userId) => {
    setDeletingId(userId);
    try {
      await authFetch(`/deleteUser`, {
        body: JSON.stringify({
          user_id: userId,
        }),
        method: "DELETE",
      });
      toast.success("User deleted successfully!");
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setDeletingId(null);
      setDeleteDialog({ open: false, type: null, id: null, name: null });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    setDeletingId(roomId);
    try {
      await deleteRoom({ roomId });
      //refetch rooms
      await fetchAllRooms();
    } catch (err) {
      toast.error("Failed to delete room");
    } finally {
      setDeletingId(null);
      setDeleteDialog({ open: false, type: null, id: null, name: null });
    }
  };

  const openDeleteDialog = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const confirmDelete = () => {
    if (deleteDialog.type === "user") {
      handleDeleteUser(deleteDialog.id);
    } else if (deleteDialog.type === "room") {
      handleDeleteRoom(deleteDialog.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Statistics totalRooms={rooms.length} totalUsers={users.length} />

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <Home className="h-4 w-4 mr-2" />
              Rooms
            </TabsTrigger>
          </TabsList>

          <UsersList
            users={users}
            openDeleteDialog={openDeleteDialog}
            deletingId={deletingId}
          />

          <RoomsList
            rooms={rooms}
            openDeleteDialog={openDeleteDialog}
            deletingId={deletingId}
          />
        </Tabs>
      </div>
      <DeleteDialog
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};
