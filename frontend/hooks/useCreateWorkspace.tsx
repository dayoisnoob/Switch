import { getErrorMessage } from "@/lib/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useCreateWorkspace(onSuccess?: () => void) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();

  const createWorkspace = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const workspace = await WorkspaceService.createWorkspace(name);

      setWorkspaces([...workspaces, workspace]);
      setActiveWorkspace(workspace);

      toast.success("Workspace was successfully created");
      if (onSuccess) onSuccess();
      router.push(`/workspace/${workspace.id}`);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return { createWorkspace, loading };
}
