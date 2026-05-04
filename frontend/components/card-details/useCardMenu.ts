import { useState } from "react";

type Menu = "status" | "priority" | "assignee" | "label" | null;

export function useCardMenus() {
  const [openMenu, setOpenMenu] = useState<Menu>(null);

  const toggleMenu = (menu: Menu) =>
    setOpenMenu((prev) => (prev === menu ? null : menu));

  const closeAll = () => setOpenMenu(null);

  return {
    openMenu,
    toggleMenu,
    closeAll,
    isStatusOpen: openMenu === "status",
    isPriorityOpen: openMenu === "priority",
  };
}
