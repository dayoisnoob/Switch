"use client";

import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal";
import { useLogout } from "@/hooks/useAuth";
import { useGetWorkspaces } from "@/hooks/useWorkspace";
import { LayoutGrid, Loader2, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GettingStartedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logout = useLogout();
  const router = useRouter();

  const { data: workspaces = [], isLoading } = useGetWorkspaces();

  useEffect(() => {
    if (!isLoading && workspaces.length > 0) {
      router.replace("/dashboard");
    }
  }, [workspaces.length, isLoading, router]);

  if (isLoading || workspaces.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E0E14]">
        <Loader2 size={32} className="animate-spin text-[#7C6EF5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0E0E14] font-sans text-white selection:bg-[#7C6EF5]/30">
      <header className="w-full h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#7C6EF5]/80 flex items-center justify-center text-white text-[11px] font-black shadow-[0_0_10px_rgba(124,110,245,0.4)]">
            S
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">
            Switch
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="text-[13px] font-medium text-white/40 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 w-full max-w-140 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500 delay-150">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-8">
            <div className="w-16 h-16 rounded-3xl bg-[#13131A] border border-white/5 flex items-center justify-center relative z-10 shadow-2xl">
              <LayoutGrid size={28} className="text-[#7C6EF5]" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#13131A] border border-white/5 flex items-center justify-center absolute -top-4 -left-4 z-0 opacity-50">
              <LayoutGrid size={20} className="text-[#7C6EF5]/50" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-3">
            Create your first workspace
          </h1>
          <p className="text-[14px] text-white/40 leading-relaxed max-w-100">
            A workspace brings your team, projects, and boards together in one
            place. Create yours to get started.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 bg-[#7C6EF5] hover:bg-[#6B5ED4] text-white rounded-xl text-[14px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 active:scale-[0.98] flex items-center justify-center gap-2 mb-12"
        >
          <Plus size={16} />
          Create workspace
        </button>

        <div className="w-full space-y-3">
          <div className="w-full p-5 bg-white/2 border border-white/5 rounded-2xl flex items-start gap-4">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shrink-0">
              <LayoutGrid size={18} className="text-[#a855f7]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[14px] font-semibold text-white/90 mb-1">
                Workspaces hold projects
              </span>
              <span className="text-[13px] text-white/40 leading-relaxed">
                Group related projects — like &quot;Acme Corp&quot; or
                &quot;Side Projects&quot; — under one workspace.
              </span>
            </div>
          </div>

          <div className="w-full p-5 bg-white/2 border border-white/5 rounded-2xl flex items-start gap-4">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 shrink-0">
              <UserPlus size={18} className="text-[#34d399]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[14px] font-semibold text-white/90 mb-1">
                Invite your team
              </span>
              <span className="text-[13px] text-white/40 leading-relaxed">
                Add members and assign roles — Owner, Admin, or Member — per
                workspace.
              </span>
            </div>
          </div>
        </div>
      </main>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
