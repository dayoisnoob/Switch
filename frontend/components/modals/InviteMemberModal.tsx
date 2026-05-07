"use client";

import {
  PendingInvites,
  useGetPendingInvites,
  useResendInvite,
  useRevokeInvite,
  useSendInvite,
} from "@/hooks/useInvitations";
import { Workspace } from "@/hooks/useWorkspace";
import { timeAgo } from "@/lib/utils";
import { ArrowRight, ChevronDown, Info, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Portal } from "../ui/Portal";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  workspace,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");

  const { mutate: revokeInvite } = useRevokeInvite(workspace!.slug);
  const { mutate: sendInvite, isPending } = useSendInvite(workspace!.slug!);
  const { mutate: resend, isPending: resendingInvite } = useResendInvite(
    workspace!.slug,
  );
  const { data: pendingInvites, isLoading } = useGetPendingInvites(
    workspace!.slug,
    isOpen,
  );

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

  const handleInvite = () => {
    if (!email.trim()) return;

    sendInvite(
      { email, role },
      {
        onSuccess: () => {
          setEmail("");
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
        <div className="relative flex w-112.5 max-w-lg flex-col rounded-xl border border-md bg-surface shadow-soft animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#a1a1a1] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1A2332] text-[#3ABFF8] flex items-center justify-center mb-5 border border-[#1A2332]">
              <UserPlus size={20} />
            </div>

            <h2 className="text-xl font-bold text-white mb-1.5 tracking-tight">
              Invite to{" "}
              <span
                style={{ color: workspace?.colour }}
                className={`px-2 py-1 rounded text-white`}
              >
                {workspace.name}
              </span>
            </h2>
            <p className="text-sm text-[#8a8a93] mb-6">
              Invite team members via email. They&apos;ll receive a link to
              join.
            </p>

            <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#8a8a93] mb-2">
                  Email address <span className="text-[#a855f7]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 bg-[#1C1C1E] border border-[#2a2a2a] rounded-lg px-3 text-sm text-white placeholder:text-[#4a4a52] focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8a8a93] mb-2">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 bg-[#1C1C1E] border border-[#2a2a2a] rounded-lg pl-3 pr-8 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm"
                  >
                    <option value="Member" className="bg-[#1C1C1E]">
                      Member
                    </option>
                    <option value="Admin" className="bg-[#1C1C1E]">
                      Admin
                    </option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a93] pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#7c6ef5]/10 border border-[#7c6ef5]/20 rounded-xl p-3.5 flex gap-3 items-start">
              <Info size={16} className="text-[#a855f7] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                <span className="text-white font-semibold">Members</span> can
                view and edit projects.{" "}
                <span className="text-white font-semibold">Admins</span> can
                also manage members and workspace settings.
              </p>
            </div>

            <div className="h-px w-full bg-[#2a2a2a] my-6" />

            <div>
              <h3 className="text-[13px] font-semibold text-[#8a8a93] mb-4">
                Pending invitations
              </h3>

              <div className="space-y-4 max-h-50 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="text-sm text-[#5a5a6a] flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#8a8a93]/30 border-t-[#8a8a93] mr-2" />
                    Loading...
                  </div>
                ) : pendingInvites && pendingInvites.length > 0 ? (
                  pendingInvites.map((invite: PendingInvites) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-xs font-bold border border-[#8B5CF6]/20 shrink-0">
                          {invite.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white truncate max-w-50">
                            {invite.email}
                          </span>
                          <span className="text-xs text-[#6a6a75] truncate">
                            Invited {timeAgo(invite.createdAt)}
                            <span> •</span>
                            <span> {invite.role}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          disabled={resendingInvite}
                          onClick={() => resend(invite.email)}
                          className="text-xs font-semibold text-[#5a5a6a] hover:text-white transition-colors"
                        >
                          Resend
                        </button>

                        <button
                          onClick={() => revokeInvite(invite.email)}
                          className="text-xs font-semibold text-[#5a5a6a] hover:text-red-400 transition-colors"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[13px] text-[#5a5a6a] py-2">
                    No pending invitations.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 h-10 rounded-lg text-sm font-semibold text-white bg-transparent border border-[#2a2a2a] hover:bg-[#252529] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!email || isPending}
                className="px-5 h-10 rounded-lg text-sm font-semibold text-white bg-[#A855F7] hover:bg-[#9333EA] flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {isPending ? "Sending..." : "Send invitation"}
                {!isPending && <ArrowRight size={16} />}{" "}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
