"use client";

import { ArrowRight, ChevronDown, Info, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  workspaceName = "Acme Corp",
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");

  // Prevent background scrolling when modal is open
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[460px] bg-[#151517] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a1a1a1] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Top Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#1A2332] text-[#3ABFF8] flex items-center justify-center mb-5 border border-[#1A2332]">
            <UserPlus size={20} />
          </div>

          {/* Headers */}
          <h2 className="text-xl font-bold text-white mb-1.5 tracking-tight">
            Invite to {workspaceName}
          </h2>
          <p className="text-sm text-[#8a8a93] mb-6">
            Invite team members via email. They&apos;ll receive a link to join.
          </p>

          {/* Form Grid */}
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

          {/* Info Callout */}
          <div className="bg-[#2a1a3a]/40 border border-[#4a2a6a]/60 rounded-xl p-3.5 flex gap-3 items-start">
            <Info size={16} className="text-[#a855f7] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
              <span className="text-white font-semibold">Members</span> can view
              and edit projects.{" "}
              <span className="text-white font-semibold">Admins</span> can also
              manage members and workspace settings.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[#2a2a2a] my-6" />

          {/* Pending Invitations */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#8a8a93] mb-4">
              Pending invitations
            </h3>
            <div className="space-y-4">
              {/* Mock Item 1 */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-xs font-bold border border-[#8B5CF6]/20">
                    RK
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      ryan.koh@acme.io
                    </span>
                    <span className="text-xs text-[#6a6a75]">
                      Invited 2 days ago · Member
                    </span>
                  </div>
                </div>
                <button className="text-xs font-semibold text-[#5a5a6a] hover:text-white transition-colors">
                  Resend
                </button>
              </div>

              {/* Mock Item 2 */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F43F5E]/20 text-[#F43F5E] flex items-center justify-center text-xs font-bold border border-[#F43F5E]/20">
                    SL
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      sofia.lara@acme.io
                    </span>
                    <span className="text-xs text-[#6a6a75]">
                      Invited 5 days ago · Admin
                    </span>
                  </div>
                </div>
                <button className="text-xs font-semibold text-[#5a5a6a] hover:text-white transition-colors">
                  Resend
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-lg text-sm font-semibold text-white bg-transparent border border-[#2a2a2a] hover:bg-[#252529] transition-colors"
            >
              Cancel
            </button>
            <button className="px-5 h-10 rounded-lg text-sm font-semibold text-white bg-[#A855F7] hover:bg-[#9333EA] flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              Send invitation <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
