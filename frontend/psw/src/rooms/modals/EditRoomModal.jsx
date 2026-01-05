import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon } from "lucide-react";

export const EditRoomModal = ({
  roomId,
  roomName: defaultRoomName,
  roomDescription,
  updateRoom,
}) => {
  const [roomName, setRoomName] = useState(defaultRoomName);
  const [description, setDescription] = useState(roomDescription);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    updateRoom({
      roomId,
      newName: roomName,
      newDescription: description,
    });
    setLoading(false);
  };

  return (
    <Dialog className="z-400">
      <DialogTrigger asChild>
        <PencilIcon className="w-3 h-3 cursor-pointer" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit your room</DialogTitle>
            <DialogDescription className="mb-2">
              Change how your room will appear in the list.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* ROOM NAME */}
            <div className="grid gap-3 mt-1">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Cool Room"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Only geeks allowed to join..."
              />
            </div>
          </div>

          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={
                roomName.length < 1 || description.length < 1 || loading
              }
              type="submit"
            >
              Update Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
