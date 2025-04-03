import { User } from "@/lib/model/type";
import { logout } from "@/services/login/authServices";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { FaRegBell } from "react-icons/fa";

export default function Topbar() {
  const [user,setUser] = useState<User|null>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New user registered" },
    { id: 2, message: "Server maintenance scheduled" },
    { id: 3, message: "New comment on your post" },
  ]);

    useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  return (
    <>
      <div className="h-20 flex justify-end items-center gap-5 bg-white pe-10 shadow-sm w-full">
        {/* <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button variant="light" isIconOnly>
              <FaRegBell size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Notification">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <DropdownItem key={notif.id}>{notif.message}</DropdownItem>
              ))
            ) : (
              <DropdownItem key={""}>No new notifications</DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown> */}
        {/* <div className="flex items-center"><p>Chi hội: <span className="font-bold"> {user?.branch?.name} </span></p></div> */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="light"
              className="hover:!bg-transparent focus:!bg-transparent active:!bg-transparent"
            >
              <Avatar  /> <span className="text-lg ps-1">{user?.name}</span>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User">
            <DropdownItem key="info">
              <div>
                <p className="font-bold">{user?.name}</p>
                <p>{user?.email}</p>
              </div>
            </DropdownItem>
            <DropdownItem key="divider"> <Divider /></DropdownItem>
            <DropdownItem key="logout">
              <Button variant="light" onPress={logout}>Đăng xuất</Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
}
