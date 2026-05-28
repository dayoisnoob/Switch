"use client";

import { useRemoveMember, WorkspaceMembers } from "@/hooks/useWorkspace";
import { getConsistentColor } from "@/lib/utils";
import { AlertTriangle, UserMinus, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: WorkspaceMembers | null;
  workspaceName: string;
  workspaceSlug: string;
}

export default function RemoveMemberModal({
  isOpen,
  onClose,
  member,
  workspaceName,
  workspaceSlug,
}: RemoveMemberModalProps) {
  const { mutate: removeMember, isPending } = useRemoveMember(workspaceSlug);

  const handleRemove = (userId: string) => {
    removeMember(userId);
    onClose();
    window.location.reload;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const name =
    (member.firstName + " " + member.lastName).trim() || "Unknown User";
  const email = member.email || "user@company.com";
  const role = member.role || "Member";
  const firstName = member.firstName || "This user";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-115 bg-[#151517] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-[#a1a1a1] hover:text-white transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="w-10 h-10 rounded-xl bg-[#3f1c22] text-[#ef4444] flex items-center justify-center mb-5 border border-[#3f1c22]">
            <UserMinus size={20} />
          </div>

          <h2 className="text-xl font-bold text-white mb-1.5 tracking-tight">
            Remove member
          </h2>
          <p className="text-[13px] text-[#8a8a93] mb-6 leading-relaxed">
            Are you sure you want to remove this member from the workspace?
          </p>

          <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-4 mb-4 flex items-center gap-3">
            {member.avatarUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#2a2a2a]">
                <Image
                  src={member.avatarUrl}
                  alt={name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{
                  backgroundColor: getConsistentColor(member.id || name),
                }}
              >
                {name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">
                {name}
              </span>
              <span className="text-[13px] text-[#8a8a93] truncate mt-0.5">
                {email} · {role} · {workspaceName}
              </span>
            </div>
          </div>

          <div className="bg-[#2a1318]/80 border border-[#7f1d1d]/40 rounded-xl p-4 flex gap-3 items-start">
            <AlertTriangle
              size={16}
              className="text-[#ef4444] shrink-0 mt-0.5"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#ef4444] mb-1">
                This can&apos;t be undone
              </span>
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                {firstName} will lose access to all projects in {workspaceName}{" "}
                immediately. Their assigned cards will remain but become
                unassigned.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 h-10 rounded-lg text-sm font-semibold text-white bg-transparent border border-[#2a2a2a] hover:bg-[#252529] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRemove(member.userId)}
              disabled={isPending}
              className="px-4 h-10 rounded-lg text-sm font-semibold text-[#ef4444] bg-[#3f1c22] border border-[#7f1d1d]/50 hover:bg-[#4c1d28] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Removing..." : "Remove member"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
