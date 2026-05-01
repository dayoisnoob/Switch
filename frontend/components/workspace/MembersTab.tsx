import { formatDate, getConsistentColor } from "@/lib/utils";
import { WorkspaceMembers } from "@/services/workspace.service";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import InviteMemberModal from "../modals/InviteMemberModal";

export const MembersTab = ({
  members,
  workspaceName,
}: {
  members: WorkspaceMembers[];
  workspaceName: string;
}) => {
  const [inviteModal, setInviteModal] = useState(false);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a1]"
            />
            <input
              type="text"
              placeholder="Search members..."
              className="h-9 w-70 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md pl-9 pr-4 text-sm text-white placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#7C6EF5] transition-colors"
            />
          </div>
          <button className="h-9 px-3 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md text-sm font-semibold text-[#a1a1a1] hover:text-white transition-colors flex items-center gap-2">
            Role <ChevronDown size={14} />
          </button>
        </div>

        <button
          onClick={() => setInviteModal(true)}
          className="h-9 px-4 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white flex items-center gap-2 rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(124,110,245,0.2)]"
        >
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {/* MEMBERS TABLE */}
      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 border-b border-[#2a2a2a] text-[11px] font-bold text-[#a1a1a1] uppercase tracking-wider">
          <div>Member</div>
          <div>Joined</div>
          <div>Role</div>
          <div className="w-8"></div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {members && members.length > 0 ? (
            [...members]
              .sort((a, b) => {
                if (a.role === "Owner") return -1;
                if (b.role === "Owner") return 1;
                return 0;
              })
              .map((member: WorkspaceMembers, index: number) => {
                const name =
                  member.firstName + " " + member.lastName || "Unknown User";
                const email = member.email || member.email || "user@switch.io";
                const role = member.role || "Member";
                const joinedDate = member.joinedAt
                  ? formatDate(member.joinedAt)
                  : "Apr 2, 2024";

                return (
                  <div
                    key={member.id || index}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 items-center border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#252529]/40 transition-colors"
                  >
                    {/* 1. Member Avatar & Name */}
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#2a2a2a]">
                          <Image
                            src={member.avatarUrl}
                            alt={name}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                            unoptimized
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: getConsistentColor(
                              member.id || name,
                            ),
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {name}
                        </span>
                        <span className="text-xs text-[#a1a1a1] truncate">
                          {email}
                        </span>
                      </div>
                    </div>

                    {/* 2. Joined Date */}
                    <div className="text-sm text-[#a1a1a1]">{joinedDate}</div>

                    {/* 3. Role Selector */}
                    <div>
                      {role === "Owner" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#7C6EF5]/10 text-[#7C6EF5] text-xs font-semibold">
                          Owner
                        </span>
                      ) : (
                        <div className="relative inline-block w-27.5">
                          <select
                            defaultValue={role}
                            className="w-full h-8 pl-3 pr-8 appearance-none bg-transparent border border-[#2a2a2a] hover:bg-[#252529] rounded text-sm text-[#a1a1a1] hover:text-white transition-colors focus:outline-none focus:border-[#7C6EF5] cursor-pointer"
                          >
                            <option
                              value="Admin"
                              className="bg-[#1C1C1E] text-white"
                            >
                              Admin
                            </option>
                            <option
                              value="Member"
                              className="bg-[#1C1C1E] text-white"
                            >
                              Member
                            </option>
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1a1] pointer-events-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* 4. Actions */}
                    <div className="w-8 flex justify-end">
                      {role !== "Owner" && (
                        <button className="text-[#a1a1a1] hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-8 text-center text-sm text-[#a1a1a1]">
              No members found.
            </div>
          )}
        </div>
      </div>

      <InviteMemberModal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        workspaceName={workspaceName}
      />
    </div>
  );
};
