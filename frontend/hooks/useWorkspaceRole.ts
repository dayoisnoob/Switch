import { useMe } from "./useAuth";
import { useGetMembers } from "./useWorkspace";

export function useWorkspaceRole(workspaceSlug: string) {
  const { data: currentUser } = useMe();
  const { data: workspaceMembers } = useGetMembers(workspaceSlug);

  const currentMember = workspaceMembers?.find(
    (m) => m.userId === currentUser?.id,
  );

  const role = currentMember?.role ?? "Member";

  return {
    role,
    isOwner: role === "Owner",
    isAdmin: role === "Admin",
    canManageWorkspace: ["Owner", "Admin"].includes(role),
  };
}
