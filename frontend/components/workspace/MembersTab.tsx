import { formatDate, getConsistentColor } from "@/lib/utils";
import { Workspace, WorkspaceMembers } from "@/services/workspace.service";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import InviteMemberModal from "../modals/InviteMemberModal";
import RemoveMemberModal from "../modals/RemoveMemberModal";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

export const MembersTab = ({
  members,
  activeWorkspace,
}: {
  members: WorkspaceMembers[];
  activeWorkspace: Workspace;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [inviteModal, setInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMembers | null>(
    null,
  );

  const { canManageWorkspace } = useWorkspaceRole(activeWorkspace.slug);

  const filteredMembers = members?.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
    const email = (member.email || "").toLowerCase();
    const matchesSearch =
      fullName.includes(searchLower) || email.includes(searchLower);

    const matchesRole = roleFilter === "All" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-70 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md pl-9 pr-4 text-sm text-white placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#7C6EF5] transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 pl-3 pr-8 appearance-none bg-[#1C1C1E] border border-[#2a2a2a] rounded-md text-sm font-semibold text-[#a1a1a1] hover:text-white transition-colors cursor-pointer focus:outline-none focus:border-[#7C6EF5]"
            >
              <option value="All">All Roles</option>
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1a1] pointer-events-none"
            />
          </div>
        </div>

        {canManageWorkspace && (
          <button
            onClick={() => setInviteModal(true)}
            className="h-9 px-4 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white flex items-center gap-2 rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(124,110,245,0.2)]"
          >
            <Plus size={16} /> Invite Member
          </button>
        )}
      </div>

      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 border-b border-[#2a2a2a] text-[11px] font-bold text-[#a1a1a1] uppercase tracking-wider">
          <div>Member</div>
          <div>Joined</div>
          <div>Role</div>
          <div className="w-8"></div>
        </div>

        <div className="flex flex-col">
          {filteredMembers && filteredMembers.length > 0 ? (
            [...filteredMembers]
              .sort((a, b) => {
                if (a.role === "Owner") return -1;
                if (b.role === "Owner") return 1;
                return 0;
              })
              .map((member: WorkspaceMembers, index: number) => {
                const name =
                  (member.firstName + " " + member.lastName).trim() ||
                  "Unknown User";
                const email = member.email || "user@switch.io";
                const role = member.role || "Member";
                const joinedDate = formatDate(member.joinedAt);

                return (
                  <div
                    key={member.id || index}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 p-4 items-center border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#252529]/40 transition-colors"
                  >
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

                    <div className="text-sm text-[#a1a1a1]">{joinedDate}</div>

                    <div>
                      {role === "Owner" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#7C6EF5]/10 text-[#7C6EF5] text-xs font-semibold">
                          Owner
                        </span>
                      ) : canManageWorkspace ? (
                        <div className="relative inline-block w-27.5">
                          <select
                            value={role}
                            onChange={(e) =>
                              console.log("Update role to:", e.target.value)
                            }
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
                      ) : (
                        <span className="text-sm text-[#a1a1a1] pl-3">
                          {role}
                        </span>
                      )}
                    </div>

                    <div className="w-8 flex justify-end">
                      {role !== "Owner" && canManageWorkspace && (
                        <button
                          onClick={() => setMemberToRemove(member)}
                          className="text-[#a1a1a1] hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-semibold text-white mb-1">
                No members found
              </span>
              <span className="text-[13px] text-[#a1a1a1]">
                Try adjusting your search or role filter.
              </span>
            </div>
          )}
        </div>
      </div>

      <InviteMemberModal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        workspace={activeWorkspace}
      />

      <RemoveMemberModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        workspaceName={activeWorkspace.name}
        workspaceSlug={activeWorkspace.slug}
      />
    </div>
  );
};
