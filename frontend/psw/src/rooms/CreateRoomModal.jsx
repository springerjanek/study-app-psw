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

import { useState, useEffect } from "react";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/auth/AuthContext";

export const CreateRoomModal = ({ createRoom }) => {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { authFetch } = useAuthFetch();
  const { user: me } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      const res = await authFetch("/users");
      const displayedUsers = res.filter((user) => user.id !== me.id);
      setUsers(displayedUsers);
    };
    loadUsers();
  }, []);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    createRoom({
      name: roomName,
      description,
      users: selectedUsers,
    });
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create your study room!</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Room Creation</DialogTitle>
            <DialogDescription>
              Start learning effectively by studying with a group of friends :)
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

            {/* DESCRIPTION */}
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Only geeks allowed to join..."
              />
            </div>

            {/* USER SELECT */}
            <Label htmlFor="users">Select your mates.</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {selectedUsers.length > 0
                    ? `${selectedUsers.length} user(s) selected`
                    : "Select users..."}
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search users..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />

                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>

                    <CommandGroup>
                      {users &&
                        users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.username}
                            onSelect={() => toggleUser(user.id)}
                          >
                            <CheckIcon
                              className={`mr-2 h-4 w-4 ${
                                selectedUsers.includes(user.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {user.username}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
              Create Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
