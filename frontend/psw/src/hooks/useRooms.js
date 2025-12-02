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
        method: "POST",
        body: JSON.stringify({ room_id: roomId, user_id: userId }),
      });
      if (result.success) {
        toast.success("User approved!");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(result.error);
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
    userHasRightsToEnter,
  };
};
