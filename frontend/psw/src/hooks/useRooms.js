import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useMemo } from "react";

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState([]);
  const [roomDetailsLoading, setRoomDetailsLoading] = useState(false);

  const [userRoomMemberships, setUserRoomMemberships] = useState([]);
  const { user } = useAuth();
  const { authFetch } = useAuthFetch();

  const userHasRightsToEnter = useMemo(() => {
    if (!roomDetails?.members) return false;
    return roomDetails.members.some((m) => m.id === user.id);
  }, [roomDetails, user.id]);

  const fetchAllRooms = async () => {
    try {
      const result = await authFetch("/allRooms");
      setRooms(result.rooms || []);
    } catch (err) {
      console.error("Error fetching all rooms:", err);
    }
  };

  const fetchUserRoomMemberships = async () => {
    try {
      const result = await authFetch("/userRoomMemberships");
      setUserRoomMemberships(result.rooms || []);
    } catch (err) {
      console.error("Error fetching user room memberships:", err);
    }
  };

  const fetchRoomDetails = async ({ roomId }) => {
    setRoomDetailsLoading(true);

    const result = await authFetch(`/roomDetails/?room_id=${roomId}`);
    setRoomDetails(result);
    setRoomDetailsLoading(false);
  };

  const createRoom = async ({ name, description, users }) => {
    try {
      const result = await authFetch("/createRoom", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          users,
          created_by: user.id,
        }),
      });

      if (result.success) {
        toast.success("Successfully created room!");
        fetchAllRooms();
        fetchUserRoomMemberships();
      }
    } catch (err) {
      console.error("Error creating room:", err);
      toast.error("Failed to create room");
    }
  };

  const requestAccess = async (roomId) => {
    try {
      const result = await authFetch("/requestRoomAccess", {
        method: "POST",
        body: JSON.stringify({ room_id: roomId }),
      });

      if (result.success) {
        toast.success("Access request sent!");
      }
    } catch (err) {
      console.error("Error requesting access:", err);
      toast.error("Failed to request access");
    }
  };

  const approveRequest = async ({ roomId, userId }) => {
    try {
      const result = await authFetch("/approveUserRequest", {
        method: "PATCH",
        body: JSON.stringify({ room_id: roomId, user_id: userId }),
      });
      if (result.success) {
        toast.success("User approved!");
        fetchRoomDetails({ roomId });
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(result.error);
    }
  };

  const searchRooms = async ({ searchQuery }) => {
    try {
      const result = await authFetch(`/searchRooms?q=${searchQuery}`);
      if (result.success) {
        setRooms(result.rooms);
      }
    } catch (error) {
      console.error("Error searching rooms:", error);
    }
  };

  const deleteRoom = async ({ roomId }) => {
    try {
      await authFetch(`/deleteRoom`, {
        body: JSON.stringify({
          room_id: roomId,
        }),
        method: "DELETE",
      });
      toast.success("Room deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  const updateRoom = async ({ roomId, newName, newDescription }) => {
    try {
      await authFetch(`/updateRoom`, {
        body: JSON.stringify({
          room_id: roomId,
          newName,
          newDescription,
        }),
        method: "PATCH",
      });
      toast.success("Room updated successfully!");
      await fetchRoomDetails({ roomId });
    } catch (err) {
      toast.error("Failed to update room");
    }
  };

  const removeMember = async ({ roomId, userId }) => {
    try {
      await authFetch(`/removeMember`, {
        body: JSON.stringify({
          room_id: roomId,
          userId,
        }),
        method: "DELETE",
      });
      toast.success("Member removed successfully!");
      await fetchRoomDetails({ roomId });
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  return {
    rooms,
    roomDetails,
    roomDetailsLoading,
    userRoomMemberships,
    fetchAllRooms,
    fetchUserRoomMemberships,
    createRoom,
    requestAccess,
    approveRequest,
    fetchRoomDetails,
    searchRooms,
    deleteRoom,
    updateRoom,
    removeMember,
    userHasRightsToEnter,
  };
};
